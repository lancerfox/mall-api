import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProductImage } from '../entities/product-image.entity';
import { UpdateProductImagesDto } from '../dto/update-product-images.dto';
import {
  ERROR_CODES,
  ERROR_MESSAGES,
} from '../../../common/constants/error-codes';
import { IApiResponse } from '../../../common/types/api-response.interface';

@Injectable()
export class ProductImageService {
  private readonly logger = new Logger(ProductImageService.name);

  constructor(
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 更新商品图片关联
   */
  async updateProductImages(
    updateProductImagesDto: UpdateProductImagesDto,
  ): Promise<IApiResponse<null>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { productId, images } = updateProductImagesDto;

      // 验证主图设置：最多只能有一个主图
      const mainImages = images.filter((img) => img.isMain);
      if (mainImages.length > 1) {
        return {
          code: ERROR_CODES.VALIDATION_FAILED,
          message: '最多只能设置一张主图',
          data: null,
        };
      }

      // 删除该商品的所有旧关联记录
      await queryRunner.manager.delete(ProductImage, { productId });

      // 创建新的关联记录
      const productImages = images.map((imageDto, index) => {
        const productImage = new ProductImage();
        productImage.productId = productId;
        productImage.imageId = imageDto.imageId; // 直接赋值字符串类型的imageId
        productImage.sortOrder = index; // 使用数组索引作为排序
        productImage.isMain = imageDto.isMain;
        return productImage;
      });

      // 批量插入新记录
      if (productImages.length > 0) {
        await queryRunner.manager.save(ProductImage, productImages);
      }

      await queryRunner.commitTransaction();

      return {
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: null,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('更新商品图片关联失败', error);
      return {
        code: ERROR_CODES.VALIDATION_FAILED,
        message: ERROR_MESSAGES[ERROR_CODES.VALIDATION_FAILED],
        data: null,
      };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取商品的图片列表
   */
  async getProductImages(productId: string): Promise<ProductImage[]> {
    return this.productImageRepository.find({
      where: { productId },
      relations: ['image'],
      order: { sortOrder: 'ASC' },
    });
  }
}
