import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException } from '@nestjs/common';
import { Model } from 'mongoose';
import { BatchOperationsService } from '../services/batch-operations.service';
import { Material, MaterialDocument } from '../entities/material.entity';
import {
  Category,
  CategoryDocument,
} from '../../category/entities/category.entity';
import { ERROR_CODES } from '../../../common/constants/error-codes';

describe('BatchOperationsService', () => {
  let service: BatchOperationsService;
  let materialModel: jest.Mocked<Model<MaterialDocument>>;
  let categoryModel: jest.Mocked<Model<CategoryDocument>>;

  const mockMaterial = {
    materialId: 'M001',
    name: '测试材料',
    categoryId: 'C001',
    price: 100,
    stock: 50,
    status: 'enabled',
  };

  const mockCategory = {
    categoryId: 'C001',
    name: '测试分类',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchOperationsService,
        {
          provide: getModelToken(Material.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            updateOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(Category.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            updateOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BatchOperationsService>(BatchOperationsService);
    materialModel = module.get(getModelToken(Material.name));
    categoryModel = module.get(getModelToken(Category.name));

    jest.clearAllMocks();
  });

  describe('batchUpdateMaterials', () => {
    it('应该成功批量更新材料', async () => {
      // 安排
      const batchUpdateDto = {
        materialIds: ['M001', 'M002'],
        updateData: {
          categoryId: 'C002',
          price: {
            type: 'multiply',
            value: 1.1,
          },
          status: 'enabled',
        },
      };
      const userId = 'user123';

      categoryModel.findOne.mockResolvedValue(mockCategory as any);
      materialModel.findOne.mockResolvedValue(mockMaterial as any);
      materialModel.updateOne.mockResolvedValue({
        modifiedCount: 1,
      } as any);

      // 执行
      const result = await service.batchUpdateMaterials(batchUpdateDto, userId);

      // 断言
      expect(result.successCount).toBe(2);
      expect(result.failedCount).toBe(0);
      expect(result.successIds).toHaveLength(2);
    });

    it('目标分类不存在时应该抛出错误', async () => {
      // 安排
      const batchUpdateDto = {
        materialIds: ['M001'],
        updateData: {
          categoryId: 'nonexistent',
        },
      };
      const userId = 'user123';

      categoryModel.findOne.mockResolvedValue(null);

      // 执行和断言
      await expect(
        service.batchUpdateMaterials(batchUpdateDto, userId),
      ).rejects.toThrow(HttpException);
    });

    it('应该正确处理价格调整', async () => {
      // 安排
      const batchUpdateDto = {
        materialIds: ['M001'],
        updateData: {
          price: {
            type: 'multiply',
            value: 1.5,
          },
        },
      };
      const userId = 'user123';

      materialModel.findOne.mockResolvedValue(mockMaterial as any);
      materialModel.updateOne.mockResolvedValue({
        modifiedCount: 1,
      } as any);

      // 执行
      await service.batchUpdateMaterials(batchUpdateDto, userId);

      // 断言 - 验证价格被正确计算（100 * 1.5 = 150）
      expect(materialModel.updateOne).toHaveBeenCalledWith(
        { materialId: 'M001' },
        expect.objectContaining({
          updatedBy: userId,
        }),
      );
    });

    it('应该正确处理库存调整', async () => {
      // 安排
      const batchUpdateDto = {
        materialIds: ['M001'],
        updateData: {
          stock: {
            type: 'add',
            value: 20,
          },
        },
      };
      const userId = 'user123';

      materialModel.findOne.mockResolvedValue(mockMaterial as any);
      materialModel.updateOne.mockResolvedValue({
        modifiedCount: 1,
      } as any);

      // 执行
      await service.batchUpdateMaterials(batchUpdateDto, userId);

      // 断言 - 验证库存被正确计算（50 + 20 = 70）
      expect(materialModel.updateOne).toHaveBeenCalledWith(
        { materialId: 'M001' },
        expect.objectContaining({
          updatedBy: userId,
        }),
      );
    });
  });

  describe('batchMoveCategory', () => {
    it('应该成功批量移动分类', async () => {
      // 安排
      const batchMoveDto = {
        materialIds: ['M001', 'M002'],
        targetCategoryId: 'C002',
      };
      const userId = 'user123';

      const targetCategory = { categoryId: 'C002', name: '目标分类' };
      categoryModel.findOne.mockResolvedValue(targetCategory as any);
      materialModel.findOne.mockResolvedValue(mockMaterial as any);
      materialModel.updateOne.mockResolvedValue({
        modifiedCount: 1,
      } as any);
      categoryModel.updateOne.mockResolvedValue({
        modifiedCount: 1,
      } as any);

      // 执行
      const result = await service.batchMoveCategory(batchMoveDto, userId);

      // 断言
      expect(result.successCount).toBe(2);
      expect(result.failedCount).toBe(0);
      expect(result.successIds).toHaveLength(2);
    });

    it('目标分类不存在时应该抛出错误', async () => {
      // 安排
      const batchMoveDto = {
        materialIds: ['M001'],
        targetCategoryId: 'nonexistent',
      };
      const userId = 'user123';

      categoryModel.findOne.mockResolvedValue(null);

      // 执行和断言
      await expect(
        service.batchMoveCategory(batchMoveDto, userId),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('batchExportMaterials', () => {
    it('应该成功导出材料数据', async () => {
      // 安排
      const exportDto = {
        materialIds: ['M001'],
        format: 'xlsx',
      };

      materialModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([mockMaterial]),
      } as any);
      
      categoryModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([mockCategory]),
      } as any);

      // 执行
      const result = await service.batchExportMaterials(exportDto);

      // 断言
      expect(result.fileUrl).toContain('/exports/');
      expect(result.fileName).toContain('materials_');
      expect(result.recordCount).toBe(1);
    });
  });
});