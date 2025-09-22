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
});
