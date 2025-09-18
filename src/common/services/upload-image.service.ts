import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';
import { Image, ImageDocument } from '../entities/image.entity';
import {
  UploadImageDto,
  BatchUploadImagesDto,
  DeleteImageDto,
  GetImageListDto,
  SetMainImageDto,
  SortImagesDto,
  BusinessType,
} from '../dto/upload-image.dto';
import { ERROR_CODES } from '../constants/error-codes';

@Injectable()
export class UploadImageService {
  constructor(
    @InjectModel(Image.name)
    private imageModel: Model<ImageDocument>,
  ) {}

  /**
   * 上传单张图片
   */
  async uploadImage(
    file: Express.Multer.File,
    body: UploadImageDto,
    userId: string,
  ) {
    try {
      // 文件验证
      if (!file) {
        return {
          code: ERROR_CODES.FILE_REQUIRED,
          message: '请选择要上传的图片',
          data: null,
        };
      }

      // 文件类型验证
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return {
          code: ERROR_CODES.INVALID_FILE_TYPE,
          message: '不支持的文件格式，仅支持 JPG、PNG、WEBP',
          data: null,
        };
      }

      // 文件大小验证 (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          code: ERROR_CODES.FILE_TOO_LARGE,
          message: '文件大小不能超过 5MB',
          data: null,
        };
      }

      // 生成文件名和路径
      const imageId =
        'IMG' + Date.now() + Math.random().toString(36).substr(2, 9);
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const uploadDir = path.join(
        process.cwd(),
        'uploads',
        body.businessType,
        today,
        body.businessId,
      );

      // 创建目录
      await fs.promises.mkdir(uploadDir, { recursive: true });

      const fileExt = path.extname(file.originalname);
      const fileName = `${imageId}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      const thumbnailPath = path.join(uploadDir, `thumb_${fileName}`);
      const mediumPath = path.join(uploadDir, `medium_${fileName}`);

      // 使用 sharp 处理图片
      const image = sharp(file.buffer);
      const metadata = await image.metadata();

      // 保存原图 (压缩质量 90%)
      await image.jpeg({ quality: 90 }).toFile(filePath);

      // 生成缩略图 (150x150)
      await image
        .resize(150, 150, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      // 生成中等尺寸图 (500x500)
      await image
        .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(mediumPath);

      // 获取排序值
      let sortOrder = body.sortOrder || 0;
      if (sortOrder === 0) {
        const maxSortOrder = await this.imageModel
          .findOne({
            businessId: body.businessId,
            businessType: body.businessType,
            status: 'active',
          })
          .sort({ sortOrder: -1 })
          .lean();
        sortOrder = maxSortOrder ? maxSortOrder.sortOrder + 1 : 1;
      }

      // 保存到数据库
      const imageEntity = new this.imageModel({
        imageId,
        businessId: body.businessId,
        businessType: body.businessType,
        fileName: file.originalname,
        filePath: `/uploads/${body.businessType}/${today}/${body.businessId}/${fileName}`,
        thumbnailPath: `/uploads/${body.businessType}/${today}/${body.businessId}/thumb_${fileName}`,
        mediumPath: `/uploads/${body.businessType}/${today}/${body.businessId}/medium_${fileName}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        width: metadata.width || 0,
        height: metadata.height || 0,
        sortOrder,
        isMain: false,
        description: body.description,
        alt: body.alt,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
      });

      await imageEntity.save();

      return {
        code: 200,
        message: '上传成功',
        data: {
          imageId,
          businessId: body.businessId,
          businessType: body.businessType,
          fileName: file.originalname,
          filePath: imageEntity.filePath,
          thumbnailPath: imageEntity.thumbnailPath,
          mediumPath: imageEntity.mediumPath,
          fileSize: file.size,
          width: metadata.width || 0,
          height: metadata.height || 0,
          sortOrder,
          isMain: false,
          description: body.description,
          alt: body.alt,
          createdAt: new Date(),
        },
      };
    } catch (error) {
      console.error('上传图片失败:', error);
      return {
        code: ERROR_CODES.UPLOAD_FAILED,
        message: '上传失败',
        data: null,
      };
    }
  }

  /**
   * 批量上传图片
   */
  async batchUploadImages(
    files: Express.Multer.File[],
    body: BatchUploadImagesDto,
    userId: string,
  ) {
    if (!files || files.length === 0) {
      return {
        code: ERROR_CODES.FILE_REQUIRED,
        message: '请选择要上传的图片',
        data: {
          successCount: 0,
          failedCount: 0,
          successList: [],
          failedList: [],
        },
      };
    }

    if (files.length > 10) {
      return {
        code: ERROR_CODES.TOO_MANY_FILES,
        message: '一次最多只能上传10张图片',
        data: {
          successCount: 0,
          failedCount: files.length,
          successList: [],
          failedList: files.map((file) => ({
            fileName: file.originalname,
            error: '超出文件数量限制',
          })),
        },
      };
    }

    const successList = [];
    const failedList = [];

    for (const file of files) {
      try {
        const result = await this.uploadImage(
          file,
          {
            businessId: body.businessId,
            businessType: body.businessType,
            file,
          } as UploadImageDto,
          userId,
        );

        if (result.code === 200 && result.data) {
          successList.push({
            imageId: result.data.imageId,
            fileName: file.originalname,
            filePath: result.data.filePath,
          });
        } else {
          failedList.push({
            fileName: file.originalname,
            error: result.message,
          });
        }
      } catch {
        failedList.push({
          fileName: file.originalname,
          error: '上传失败',
        });
      }
    }

    return {
      code: 200,
      message: '批量上传完成',
      data: {
        successCount: successList.length,
        failedCount: failedList.length,
        successList,
        failedList,
      },
    };
  }

  /**
   * 删除图片
   */
  async deleteImage(body: DeleteImageDto) {
    try {
      const image = await this.imageModel.findOne({
        imageId: body.imageId,
        status: 'active',
      });

      if (!image) {
        return {
          code: ERROR_CODES.IMAGE_NOT_FOUND,
          message: '图片不存在',
          data: null,
        };
      }

      // 软删除
      await this.imageModel.updateOne(
        { imageId: body.imageId },
        {
          status: 'deleted',
          updatedAt: new Date(),
        },
      );

      // 删除实际文件
      try {
        const fullPath = path.join(process.cwd(), image.filePath);
        const thumbnailFullPath = path.join(
          process.cwd(),
          image.thumbnailPath || '',
        );
        const mediumFullPath = path.join(process.cwd(), image.mediumPath || '');

        await fs.promises.unlink(fullPath).catch(() => {}); // 忽略文件不存在的错误
        await fs.promises.unlink(thumbnailFullPath).catch(() => {});
        if (mediumFullPath) {
          await fs.promises.unlink(mediumFullPath).catch(() => {});
        }
      } catch (fileError) {
        console.warn('删除文件时出错:', fileError);
      }

      return {
        code: 200,
        message: '删除成功',
        data: null,
      };
    } catch (error) {
      console.error('删除图片失败:', error);
      return {
        code: ERROR_CODES.UPLOAD_FAILED,
        message: '删除失败',
        data: null,
      };
    }
  }

  /**
   * 获取图片列表
   */
  async getImageList(query: GetImageListDto) {
    try {
      const images = await this.imageModel
        .find({
          businessId: query.businessId,
          businessType: query.businessType,
          status: 'active',
        })
        .sort({ sortOrder: 1 })
        .lean()
        .exec();

      const formattedImages = images.map((image) => ({
        imageId: image.imageId,
        businessId: image.businessId,
        businessType: image.businessType,
        fileName: image.fileName,
        filePath: image.filePath,
        thumbnailPath: image.thumbnailPath,
        mediumPath: image.mediumPath,
        fileSize: image.fileSize,
        width: image.width,
        height: image.height,
        sortOrder: image.sortOrder,
        isMain: image.isMain,
        description: image.description,
        alt: image.alt,
        createdAt: image.createdAt,
      }));

      return {
        code: 200,
        message: '获取成功',
        data: formattedImages,
      };
    } catch (error) {
      console.error('获取图片列表失败:', error);
      return {
        code: ERROR_CODES.UPLOAD_FAILED,
        message: '获取失败',
        data: [],
      };
    }
  }

  /**
   * 设置主图
   */
  async setMainImage(body: SetMainImageDto) {
    try {
      const image = await this.imageModel.findOne({
        imageId: body.imageId,
        status: 'active',
      });

      if (!image) {
        return {
          code: ERROR_CODES.IMAGE_NOT_FOUND,
          message: '图片不存在',
          data: null,
        };
      }

      // 先将该业务的所有图片设为非主图
      await this.imageModel.updateMany(
        {
          businessId: image.businessId,
          businessType: image.businessType,
          status: 'active',
        },
        { isMain: false, updatedAt: new Date() },
      );

      // 设置指定图片为主图
      await this.imageModel.updateOne(
        { imageId: body.imageId },
        {
          isMain: true,
          sortOrder: 0,
          updatedAt: new Date(),
        },
      );

      return {
        code: 200,
        message: '设置成功',
        data: null,
      };
    } catch (error) {
      console.error('设置主图失败:', error);
      return {
        code: ERROR_CODES.UPLOAD_FAILED,
        message: '设置失败',
        data: null,
      };
    }
  }

  /**
   * 调整图片排序
   */
  async sortImages(body: SortImagesDto) {
    try {
      // 验证所有图片ID都属于指定业务
      const images = await this.imageModel.find({
        imageId: { $in: body.imageIds },
        businessId: body.businessId,
        businessType: body.businessType,
        status: 'active',
      });

      if (images.length !== body.imageIds.length) {
        return {
          code: ERROR_CODES.IMAGE_NOT_FOUND,
          message: '部分图片不存在或不属于指定业务',
          data: null,
        };
      }

      // 更新排序
      const updatePromises = body.imageIds.map((imageId, index) =>
        this.imageModel.updateOne(
          { imageId },
          { sortOrder: index, updatedAt: new Date() },
        ),
      );

      await Promise.all(updatePromises);

      return {
        code: 200,
        message: '排序成功',
        data: null,
      };
    } catch (error) {
      console.error('排序失败:', error);
      return {
        code: ERROR_CODES.UPLOAD_FAILED,
        message: '排序失败',
        data: null,
      };
    }
  }

  /**
   * 根据业务类型和业务ID获取主图
   */
  async getMainImage(businessId: string, businessType: BusinessType) {
    try {
      const mainImage = await this.imageModel
        .findOne({
          businessId,
          businessType,
          isMain: true,
          status: 'active',
        })
        .lean()
        .exec();

      return mainImage;
    } catch (error) {
      console.error('获取主图失败:', error);
      return null;
    }
  }

  /**
   * 根据业务类型和业务ID获取所有图片
   */
  async getImagesByBusiness(businessId: string, businessType: BusinessType) {
    try {
      const images = await this.imageModel
        .find({
          businessId,
          businessType,
          status: 'active',
        })
        .sort({ sortOrder: 1 })
        .lean()
        .exec();

      return images;
    } catch (error) {
      console.error('获取业务图片失败:', error);
      return [];
    }
  }
}
