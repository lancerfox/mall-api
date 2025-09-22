import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, MaterialDocument } from '../entities/material.entity';
import {
  Category,
  CategoryDocument,
} from '../../category/entities/category.entity';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { BatchMoveCategoryDto } from '../dto/batch-operations.dto';
import { BatchMoveCategoryResponseDto } from '../dto/batch-operations-response.dto';

@Injectable()
export class BatchOperationsService {
  constructor(
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async batchMoveCategory(
    batchMoveDto: BatchMoveCategoryDto,
    userId: string,
  ): Promise<BatchMoveCategoryResponseDto> {
    const { materialIds, targetCategoryId } = batchMoveDto;

    // 验证目标分类
    const targetCategory = await this.categoryModel.findOne({
      categoryId: targetCategoryId,
    });
    if (!targetCategory) {
      throw new HttpException('目标分类不存在', ERROR_CODES.CATEGORY_NOT_FOUND);
    }

    const successIds: string[] = [];
    const failedList: { materialId: string; error: string }[] = [];

    for (const materialId of materialIds) {
      try {
        const material = await this.materialModel.findOne({ materialId });
        if (!material) {
          failedList.push({ materialId, error: '材料不存在' });
          continue;
        }

        const oldCategoryId = material.categoryId;

        // 更新材料分类
        await this.materialModel.updateOne(
          { materialId },
          { categoryId: targetCategoryId, updatedBy: userId },
        );

        // 更新分类材料数量
        if (oldCategoryId !== targetCategoryId) {
          await Promise.all([
            this.categoryModel.updateOne(
              { categoryId: oldCategoryId },
              { $inc: { materialCount: -1 } },
            ),
            this.categoryModel.updateOne(
              { categoryId: targetCategoryId },
              { $inc: { materialCount: 1 } },
            ),
          ]);
        }

        successIds.push(materialId);
      } catch (error: any) {
        failedList.push({
          materialId,
          error: (error as Error).message || '移动失败',
        });
      }
    }

    return {
      successCount: successIds.length,
      failedCount: failedList.length,
      successIds,
      failedList,
    };
  }
}
