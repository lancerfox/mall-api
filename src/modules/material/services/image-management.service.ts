import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';
import {
  MaterialImage,
  MaterialImageDocument,
} from '../entities/material-image.entity';
import {
  UploadImageDto,
  BatchUploadImagesDto,
  DeleteImageDto,
  GetImageListDto,
  SetMainImageDto,
  SortImagesDto,
} from '../dto/image-management.dto';

@Injectable()
export class ImageManagementService {
  constructor(
    @InjectModel(MaterialImage.name)
    private materialImageModel: Model<MaterialImageDocument>,
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
          code: 4001,
          message: '请选择要上传的图片',
          data: null,
        };
      }

      // 文件类型验证
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return {
          code: 4002,
          message: '不支持的文件格式，仅支持 JPG、PNG、WEBP',
          data: null,
        };
      }

      // 文件大小验证 (5MB)
      const maxSize = 5 * 1024 * 1024;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (file.size > maxSize) {
        return {
          code: 4003,
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
        'materials',
        today,
        body.materialId,
      );

      // 创建目录
      await fs.promises.mkdir(uploadDir, { recursive: true });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
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
        const maxSortOrder = await this.materialImageModel
          .findOne({ materialId: body.materialId, status: 'active' })
          .sort({ sortOrder: -1 })
          .lean();
        sortOrder = maxSortOrder ? maxSortOrder.sortOrder + 1 : 1;
      }

      // 保存到数据库
      const materialImage = new this.materialImageModel({
        imageId,
        materialId: body.materialId,
        fileName: file.originalname,
        filePath: `/uploads/materials/${today}/${body.materialId}/${fileName}`,
        thumbnailPath: `/uploads/materials/${today}/${body.materialId}/thumb_${fileName}`,
        mediumPath: `/uploads/materials/${today}/${body.materialId}/medium_${fileName}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        fileSize: file.size,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        mimeType: file.mimetype,
        width: metadata.width || 0,
        height: metadata.height || 0,
        sortOrder,
        isMain: false,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
      });

      await materialImage.save();

      return {
        code: 200,
        message: '上传成功',
        data: {
          imageId,
          fileName: file.originalname,
          filePath: materialImage.filePath,
          thumbnailPath: materialImage.thumbnailPath,
          fileSize: file.size,
          width: metadata.width || 0,
          height: metadata.height || 0,
          sortOrder,
          isMain: false,
          createdAt: new Date(),
        },
      };
    } catch (error) {
      console.error('上传图片失败:', error);
      return {
        code: 5001,
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
        code: 4001,
        message: '请选择要上传的图片',
        data: {
          successCount: 0,
          failedCount: 0,
          successList: [],
          failedList: [],
        },
      };
    }

    const successList = [];
    const failedList = [];

    for (const file of files) {
      try {
        const result = await this.uploadImage(
          file,
          { materialId: body.materialId, file } as UploadImageDto,
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
      } catch (error) {
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
  async deleteImage(body: DeleteImageDto, userId: string) {
    try {
      const image = await this.materialImageModel.findOne({
        imageId: body.imageId,
        status: 'active',
      });

      if (!image) {
        return {
          code: 4001,
          message: '图片不存在',
          data: null,
        };
      }

      // 软删除
      await this.materialImageModel.updateOne(
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
    } catch {
      return {
        code: 5001,
        message: '删除失败',
        data: null,
      };
    }
  }

  /**
   * 获取材料图片列表
   */
  async getImageList(query: GetImageListDto) {
    try {
      const images = await this.materialImageModel
        .find({
          materialId: query.materialId,
          status: 'active',
        })
        .sort({ sortOrder: 1 })
        .lean()
        .exec();

      const formattedImages = images.map((image: any) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        imageId: image.imageId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        fileName: image.fileName,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        filePath: image.filePath,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        thumbnailPath: image.thumbnailPath,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        fileSize: image.fileSize,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        width: image.width,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        height: image.height,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        sortOrder: image.sortOrder,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        isMain: image.isMain,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        createdAt: image.createdAt,
      }));

      return {
        code: 200,
        message: '获取成功',
        data: formattedImages,
      };
    } catch {
      return {
        code: 5001,
        message: '获取失败',
        data: [],
      };
    }
  }

  /**
   * 设置主图
   */
  async setMainImage(body: SetMainImageDto, userId: string) {
    try {
      const image = await this.materialImageModel.findOne({
        imageId: body.imageId,
        status: 'active',
      });

      if (!image) {
        return {
          code: 4001,
          message: '图片不存在',
          data: null,
        };
      }

      // 先将该材料的所有图片设为非主图
      await this.materialImageModel.updateMany(
        { materialId: image.materialId, status: 'active' },
        { isMain: false, updatedAt: new Date() },
      );

      // 设置指定图片为主图
      await this.materialImageModel.updateOne(
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
    } catch {
      return {
        code: 5001,
        message: '设置失败',
        data: null,
      };
    }
  }

  /**
   * 调整图片排序
   */
  async sortImages(body: SortImagesDto, userId: string) {
    try {
      // 验证所有图片ID都属于指定材料
      const images = await this.materialImageModel.find({
        imageId: { $in: body.imageIds },
        materialId: body.materialId,
        status: 'active',
      });

      if (images.length !== body.imageIds.length) {
        return {
          code: 4001,
          message: '部分图片不存在或不属于指定材料',
          data: null,
        };
      }

      // 更新排序
      const updatePromises = body.imageIds.map((imageId, index) =>
        this.materialImageModel.updateOne(
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
    } catch {
      return {
        code: 5001,
        message: '排序失败',
        data: null,
      };
    }
  }
}
