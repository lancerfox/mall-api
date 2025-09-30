import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { ERROR_CODES } from 'src/common/constants/error-codes';
import { Repository, In } from 'typeorm';
import { Image } from '../entities/image.entity';
import { CreateImageDto } from '../dto/create-image.dto';
import { ImageListDto } from '../dto/image-list.dto';
import { UploadTokenDto } from '../dto/upload-token.dto';
import { SupabaseService } from './supabase.service';
import { ImageListResponseDto } from '../dto/image-list-response.dto';
import {
  UploadTokenResponseDto,
  CreateImageResponseDto,
} from '../dto/image-response.dto';
import { ImagePathUtil } from '../../../common/utils/image-path.util';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * 获取Supabase上传凭证
   */
  async getUploadToken(
    uploadTokenDto: UploadTokenDto,
  ): Promise<UploadTokenResponseDto> {
    const { businessModule, fileType } = uploadTokenDto;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(fileType.toLowerCase())) {
      throw new BusinessException(ERROR_CODES.IMAGE_INVALID_FORMAT);
    }

    const moduleName = businessModule || 'default';
    const now = new Date();
    const dateFolder = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileType.split('/')[1] || 'jpg';
    const uniqueFileName = `${timestamp}_${randomStr}.${fileExtension}`;
    const filePath = `${moduleName}/${dateFolder}/${uniqueFileName}`;

    this.logger.log(
      `文件上传请求: 业务模块=${moduleName}, 类型=${fileType}, 存储路径=${filePath}`,
    );

    const result = await this.supabaseService.createSignedUploadUrl(filePath);

    if (result.error) {
      this.logger.error('Supabase生成预签名URL失败:', result.error);
      throw new BusinessException(ERROR_CODES.IMAGE_SUPABASE_ERROR);
    }

    this.logger.log(`预签名URL生成成功: ${filePath}`);

    const url = new URL(result.signedUrl);
    const token = url.searchParams.get('token') || result.signedUrl;

    return {
      token,
      path: result.path,
    };
  }

  /**
   * 创建图片记录
   */
  async createImage(
    createImageDto: CreateImageDto,
  ): Promise<CreateImageResponseDto> {
    try {
      const imageData = this.imageRepository.create(createImageDto);
      const savedImage = await this.imageRepository.save(imageData);

      this.logger.log(
        `图片记录创建成功: ID=${savedImage.id}, Path=${savedImage.path}`,
      );

      return {
        id: savedImage.id,
        createdAt: savedImage.createdAt,
      };
    } catch (error) {
      this.logger.error('创建图片记录失败', error);
      throw new BusinessException(ERROR_CODES.IMAGE_UPLOAD_FAILED);
    }
  }

  /**
   * 获取图片库列表
   */
  async getImageList(
    imageListDto: ImageListDto,
  ): Promise<ImageListResponseDto> {
    const { page, pageSize } = imageListDto;
    const skip = (page - 1) * pageSize;

    const [images, total] = await this.imageRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    const list = images.map((image) => ({
      id: image.id,
      url: ImagePathUtil.buildImageUrl(image.path, this.supabaseService),
      name: image.name,
      size: image.size,
      createdAt: image.createdAt,
    }));

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 删除单张图片
   */
  async deleteImage(imageId: string): Promise<void> {
    const image = await this.imageRepository.findOne({ where: { id: imageId } });
    if (!image) {
      throw new BusinessException(ERROR_CODES.IMAGE_NOT_FOUND);
    }

    const deleteResult = await this.supabaseService.deleteFile(image.path);
    if (!deleteResult.success) {
      this.logger.warn(
        `Supabase文件删除失败: ${deleteResult.error}, 但继续删除数据库记录`,
      );
    }

    await this.imageRepository.remove(image);
    this.logger.log(`图片删除成功: ID=${imageId}, Path=${image.path}`);
  }

  /**
   * 批量删除图片
   */
  async batchDeleteImages(imageIds: string[]): Promise<void> {
    const images = await this.imageRepository.find({
      where: { id: In(imageIds) },
    });

    const foundIds = images.map((img) => img.id);
    const notFoundIds = imageIds.filter((id) => !foundIds.includes(id));

    if (notFoundIds.length > 0) {
      // 可以考虑创建一个更具体的错误码来传递不存在的ID列表
      throw new BusinessException(ERROR_CODES.IMAGE_NOT_FOUND);
    }

    for (const image of images) {
      const deleteResult = await this.supabaseService.deleteFile(image.path);
      if (!deleteResult.success) {
        this.logger.warn(
          `Supabase文件删除失败: ${deleteResult.error}, 但继续删除数据库记录`,
        );
      }
    }

    await this.imageRepository.remove(images);
    this.logger.log(`批量图片删除成功: IDs=${imageIds.join(', ')}`);
  }

  /**
   * 检查Supabase连接状态
   */
  async checkSupabaseConnection(): Promise<{
    connected: boolean;
    bucketExists: boolean;
  }> {
    try {
      const bucketExists = await this.supabaseService.checkBucketExists();
      return {
        connected: true,
        bucketExists,
      };
    } catch (error) {
      this.logger.error('检查Supabase连接失败', error);
      throw new BusinessException(ERROR_CODES.IMAGE_SUPABASE_ERROR);
    }
  }
}
