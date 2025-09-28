import { Injectable, Logger, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';
import { CreateImageDto } from '../dto/create-image.dto';
import { ImageListDto } from '../dto/image-list.dto';
import { UploadTokenDto } from '../dto/upload-token.dto';
import { SupabaseService } from './supabase.service';
import {
  ERROR_CODES,
  ERROR_MESSAGES,
} from '../../../common/constants/error-codes';
import { IApiResponse } from '../../../common/types/api-response.interface';
import { ImageListResponseDto } from '../dto/image-list-response.dto';
import {
  UploadTokenResponseDto,
  CreateImageResponseDto,
} from '../dto/image-response.dto';

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
  ): Promise<IApiResponse<UploadTokenResponseDto>> {
    try {
      const { businessModule, fileType } = uploadTokenDto;

      // 验证文件类型
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
      ];
      if (!allowedTypes.includes(fileType.toLowerCase())) {
        return {
          code: ERROR_CODES.IMAGE_INVALID_FORMAT,
          message: ERROR_MESSAGES[ERROR_CODES.IMAGE_INVALID_FORMAT],
          data: null,
        };
      }

      // 设置默认业务模块
      const moduleName = businessModule || 'default';

      // 生成日期格式的文件夹
      const now = new Date();
      const dateFolder = `${now.getFullYear()}-${String(
        now.getMonth() + 1,
      ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      // 生成唯一文件名
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const fileExtension = fileType.split('/')[1] || 'jpg';
      const uniqueFileName = `${timestamp}_${randomStr}.${fileExtension}`;

      // 构建文件路径：业务模块/日期/文件名
      const filePath = `${moduleName}/${dateFolder}/${uniqueFileName}`;

      this.logger.log(
        `文件上传请求: 业务模块=${moduleName}, 类型=${fileType}, 存储路径=${filePath}`,
      );

      // 使用Supabase服务生成预签名URL
      const result = await this.supabaseService.createSignedUploadUrl(filePath);

      if (result.error) {
        this.logger.error('Supabase生成预签名URL失败:', result.error);
        return {
          code: ERROR_CODES.IMAGE_SUPABASE_ERROR,
          message: `Supabase错误: ${result.error}`,
          data: null,
        };
      }

      this.logger.log(`预签名URL生成成功: ${filePath}`);

      // 从signedUrl中提取token部分
      const url = new URL(result.signedUrl);
      const token = url.searchParams.get('token') || result.signedUrl;

      return {
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: {
          token,
          path: result.path,
        },
      };
    } catch (error) {
      this.logger.error('获取上传凭证失败', error);
      return {
        code: ERROR_CODES.IMAGE_SUPABASE_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.IMAGE_SUPABASE_ERROR],
        data: null,
      };
    }
  }

  /**
   * 创建图片记录
   */
  async createImage(
    createImageDto: CreateImageDto,
  ): Promise<IApiResponse<CreateImageResponseDto>> {
    try {
      const imageData = {
        path: createImageDto.path,
        name: createImageDto.name,
        size: createImageDto.size,
        mimeType: createImageDto.mimeType,
      };

      const image = this.imageRepository.create(imageData);
      const savedImage = await this.imageRepository.save(image);

      this.logger.log(
        `图片记录创建成功: ID=${savedImage.id}, Path=${savedImage.path}`,
      );

      return {
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: {
          id: savedImage.id,
          createdAt: savedImage.createdAt,
        },
      };
    } catch (error) {
      this.logger.error('创建图片记录失败', error);
      return {
        code: ERROR_CODES.IMAGE_UPLOAD_FAILED,
        message: ERROR_MESSAGES[ERROR_CODES.IMAGE_UPLOAD_FAILED],
        data: null,
      };
    }
  }

  /**
   * 获取图片库列表
   */
  async getImageList(
    imageListDto: ImageListDto,
  ): Promise<ImageListResponseDto> {
    try {
      const { page, pageSize } = imageListDto;
      const skip = (page - 1) * pageSize;

      const [images, total] = await this.imageRepository.findAndCount({
        order: { createdAt: 'DESC' },
        skip,
        take: pageSize,
      });

      const data = images.map((image) => ({
        id: image.id,
        name: image.name,
        size: image.size,
        createdAt: image.createdAt,
      }));

      const totalPages = Math.ceil(total / pageSize);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      this.logger.error('获取图片列表失败', error);
      throw new HttpException(
        ERROR_MESSAGES[ERROR_CODES.VALIDATION_FAILED],
        ERROR_CODES.VALIDATION_FAILED,
      );
    }
  }

  /**
   * 删除图片
   */
  async deleteImage(imageId: number): Promise<IApiResponse<null>> {
    try {
      // 查找图片记录
      const image = await this.imageRepository.findOne({
        where: { id: imageId },
      });
      if (!image) {
        return {
          code: ERROR_CODES.IMAGE_NOT_FOUND,
          message: ERROR_MESSAGES[ERROR_CODES.IMAGE_NOT_FOUND],
          data: null,
        };
      }

      // 从Supabase删除文件
      const deleteResult = await this.supabaseService.deleteFile(image.path);
      if (!deleteResult.success) {
        this.logger.warn(
          `Supabase文件删除失败: ${deleteResult.error}, 但继续删除数据库记录`,
        );
      }

      // 从数据库删除记录
      await this.imageRepository.remove(image);

      this.logger.log(`图片删除成功: ID=${imageId}, Path=${image.path}`);

      return {
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: null,
      };
    } catch (error) {
      this.logger.error('删除图片失败', error);
      return {
        code: ERROR_CODES.VALIDATION_FAILED,
        message: ERROR_MESSAGES[ERROR_CODES.VALIDATION_FAILED],
        data: null,
      };
    }
  }

  /**
   * 检查Supabase连接状态
   */
  async checkSupabaseConnection(): Promise<
    IApiResponse<{ connected: boolean; bucketExists: boolean }>
  > {
    try {
      const bucketExists = await this.supabaseService.checkBucketExists();

      return {
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: {
          connected: true,
          bucketExists,
        },
      };
    } catch (error) {
      this.logger.error('检查Supabase连接失败', error);
      return {
        code: ERROR_CODES.IMAGE_SUPABASE_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.IMAGE_SUPABASE_ERROR],
        data: {
          connected: false,
          bucketExists: false,
        },
      };
    }
  }
}
