import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, MaterialDocument } from '../entities/material.entity';
import {
  Category,
  CategoryDocument,
} from '../../category/entities/category.entity';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import {
  BatchUpdateMaterialDto,
  BatchMoveCategoryDto,
  BatchExportDto,
} from '../dto/batch-operations.dto';
import {
  BatchUpdateResponseDto,
  BatchMoveCategoryResponseDto,
  BatchExportResponseDto,
} from '../dto/batch-operations-response.dto';

@Injectable()
export class BatchOperationsService {
  constructor(
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async batchUpdateMaterials(
    batchUpdateDto: BatchUpdateMaterialDto,
    userId: string,
  ): Promise<BatchUpdateResponseDto> {
    const { materialIds, updateData } = batchUpdateDto;
    const successIds: string[] = [];
    const failedList: { materialId: string; error: string }[] = [];

    // 验证分类（如果有的话）
    if (updateData.categoryId) {
      const category = await this.categoryModel.findOne({
        categoryId: updateData.categoryId,
      });
      if (!category) {
        throw new HttpException(
          '目标分类不存在',
          ERROR_CODES.CATEGORY_NOT_FOUND,
        );
      }
    }

    for (const materialId of materialIds) {
      try {
        const material = await this.materialModel.findOne({ materialId });
        if (!material) {
          failedList.push({ materialId, error: '材料不存在' });
          continue;
        }

        // 构建更新数据
        const updateFields: Record<string, any> = { updatedBy: userId };

        // 分类更新
        if (updateData.categoryId) {
          updateFields.categoryId = updateData.categoryId;
        }

        // 状态更新
        if (updateData.status) {
          updateFields.status = updateData.status;
        }

        await this.materialModel.updateOne({ materialId }, updateFields);
        successIds.push(materialId);
      } catch (error: any) {
        failedList.push({
          materialId,
          error: (error as Error).message || '更新失败',
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

  async batchExportMaterials(
    exportDto: BatchExportDto,
  ): Promise<BatchExportResponseDto> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { materialIds, fields, format = 'xlsx' } = exportDto;

    // 构建查询条件
    const filter: Record<string, any> = {};
    if (materialIds && materialIds.length > 0) {
      filter.materialId = { $in: materialIds };
    }

    // 获取材料数据
    const materials = await this.materialModel.find(filter).lean();

    // 获取分类信息
    const categoryIds = [...new Set(materials.map((m) => m.categoryId))];
    const categories = await this.categoryModel
      .find({ categoryId: { $in: categoryIds } })
      .lean();

    const categoryMap = new Map(categories.map((c) => [c.categoryId, c.name]));

    // 组装导出数据
    const exportData = materials.map((material) => ({
      materialId: material.materialId,
      name: material.name,
      categoryName: categoryMap.get(material.categoryId) || '',
      description: material.description || '',
      color: material.color || '',
      hardness: material.hardness || '',
      density: material.density || '',
      status: material.status,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
    }));

    // 生成文件名
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .split('T')[0];
    const fileName = `materials_${timestamp}_${Date.now()}.${format}`;
    const fileUrl = `/exports/${fileName}`;

    // TODO: 实际的文件生成逻辑需要使用 xlsx 库
    // 这里返回模拟数据
    return {
      fileUrl,
      fileName,
      fileSize: exportData.length * 1024, // 模拟文件大小
      recordCount: exportData.length,
    };
  }
}