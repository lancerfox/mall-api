import { Injectable } from '@nestjs/common';
import { UploadImageService } from '../../../common/services/upload-image.service';
import { BusinessType } from '../../../common/dto/upload-image.dto';
import {
  UploadImageDto as MaterialUploadImageDto,
  BatchUploadImagesDto as MaterialBatchUploadImagesDto,
  DeleteImageDto,
  GetImageListDto as MaterialGetImageListDto,
  SetMainImageDto,
  SortImagesDto as MaterialSortImagesDto,
} from '../dto/image-management.dto';

/**
 * 材料图片适配器服务
 * 用于保持材料模块的接口兼容性，内部调用通用图片上传服务
 */
@Injectable()
export class MaterialImageAdapterService {
  constructor(private readonly uploadImageService: UploadImageService) {}

  /**
   * 上传单张图片
   */
  async uploadImage(
    file: Express.Multer.File,
    body: MaterialUploadImageDto,
    userId: string,
  ) {
    return await this.uploadImageService.uploadImage(
      file,
      {
        businessId: body.materialId,
        businessType: BusinessType.MATERIAL,
        sortOrder: body.sortOrder,
        file,
      },
      userId,
    );
  }

  /**
   * 批量上传图片
   */
  async batchUploadImages(
    files: Express.Multer.File[],
    body: MaterialBatchUploadImagesDto,
    userId: string,
  ) {
    return await this.uploadImageService.batchUploadImages(
      files,
      {
        businessId: body.materialId,
        businessType: BusinessType.MATERIAL,
        files,
      },
      userId,
    );
  }

  /**
   * 删除图片
   */
  async deleteImage(body: DeleteImageDto) {
    return await this.uploadImageService.deleteImage(body);
  }

  /**
   * 获取材料图片列表
   */
  async getImageList(query: MaterialGetImageListDto) {
    return await this.uploadImageService.getImageList({
      businessId: query.materialId,
      businessType: BusinessType.MATERIAL,
    });
  }

  /**
   * 设置主图
   */
  async setMainImage(body: SetMainImageDto) {
    return await this.uploadImageService.setMainImage(body);
  }

  /**
   * 调整图片排序
   */
  async sortImages(body: MaterialSortImagesDto) {
    return await this.uploadImageService.sortImages({
      businessId: body.materialId,
      businessType: BusinessType.MATERIAL,
      imageIds: body.imageIds,
    });
  }

  /**
   * 获取材料主图
   */
  async getMainImage(materialId: string) {
    return await this.uploadImageService.getMainImage(
      materialId,
      BusinessType.MATERIAL,
    );
  }

  /**
   * 获取材料所有图片
   */
  async getImagesByMaterial(materialId: string) {
    return await this.uploadImageService.getImagesByBusiness(
      materialId,
      BusinessType.MATERIAL,
    );
  }
}
