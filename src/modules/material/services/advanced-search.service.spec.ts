import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException } from '@nestjs/common';
import { Model } from 'mongoose';
import { AdvancedSearchService } from './advanced-search.service';
import { Material, MaterialDocument } from '../entities/material.entity';
import {
  Category,
  CategoryDocument,
} from '../../category/entities/category.entity';
import {
  SearchCondition,
  SearchConditionDocument,
} from '../entities/search-condition.entity';
import { ERROR_CODES } from '../../../common/constants/error-codes';

describe('AdvancedSearchService', () => {
  let service: AdvancedSearchService;
  let materialModel: jest.Mocked<Model<MaterialDocument>>;
  let categoryModel: jest.Mocked<Model<CategoryDocument>>;
  let searchConditionModel: jest.Mocked<Model<SearchConditionDocument>>;

  const mockMaterial = {
    materialId: 'M001',
    name: '红玛瑙',
    categoryId: 'C001',
    price: 100,
    stock: 50,
    status: 'enabled',
    createdAt: new Date(),
  };

  const mockCategory = {
    categoryId: 'C001',
    name: '宝石类',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdvancedSearchService,
        {
          provide: getModelToken(Material.name),
          useValue: {
            find: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken(Category.name),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getModelToken(SearchCondition.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            updateMany: jest.fn(),
            deleteOne: jest.fn(),
            updateOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdvancedSearchService>(AdvancedSearchService);
    materialModel = module.get(getModelToken(Material.name));
    categoryModel = module.get(getModelToken(Category.name));
    searchConditionModel = module.get(getModelToken(SearchCondition.name));

    jest.clearAllMocks();
  });

  describe('advancedSearch', () => {
    it('应该成功执行高级搜索', async () => {
      // 安排
      const searchDto = {
        page: 1,
        pageSize: 20,
        conditions: {
          name: '玛瑙',
          priceMin: 50,
          priceMax: 200,
        },
      };

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockMaterial]),
      };

      materialModel.find.mockReturnValue(mockQuery as any);
      materialModel.countDocuments.mockResolvedValue(1);
      categoryModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([mockCategory]),
      } as any);

      // 执行
      const result = await service.advancedSearch(searchDto);

      // 断言
      expect(result).toBeDefined();
      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
      expect(result.searchTime).toBeGreaterThan(0);
    });

    it('应该正确构建搜索条件', async () => {
      // 安排
      const searchDto = {
        page: 1,
        pageSize: 20,
        conditions: {
          name: '玛瑙',
          categoryIds: ['C001'],
          priceMin: 50,
          priceMax: 200,
          status: ['enabled'],
        },
      };

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };

      materialModel.find.mockReturnValue(mockQuery as any);
      materialModel.countDocuments.mockResolvedValue(0);
      categoryModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      } as any);

      // 执行
      await service.advancedSearch(searchDto);

      // 断言 - 检查是否调用了正确的查询条件
      expect(materialModel.find).toHaveBeenCalledWith({
        name: { $regex: '玛瑙', $options: 'i' },
        categoryId: { $in: ['C001'] },
        price: { $gte: 50, $lte: 200 },
        status: { $in: ['enabled'] },
      });
    });
  });

  describe('saveSearchCondition', () => {
    it('应该成功保存搜索条件', async () => {
      // 安排
      const saveDto = {
        name: '高价值宝石',
        conditions: { priceMin: 100 },
        isDefault: false,
      };
      const userId = 'user123';

      searchConditionModel.findOne.mockResolvedValue(null);

      // Mock 构造函数
      const mockSave = jest.fn().mockResolvedValue({
        conditionId: 'SC001',
      });
      const MockSearchCondition = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));
      (searchConditionModel as any).mockImplementation = MockSearchCondition;

      jest.spyOn(service, 'saveSearchCondition').mockResolvedValue({
        conditionId: 'SC001',
      });

      // 执行
      const result = await service.saveSearchCondition(saveDto, userId);

      // 断言
      expect(result).toEqual({ conditionId: 'SC001' });
    });

    it('名称重复时应该抛出错误', async () => {
      // 安排
      const saveDto = {
        name: '重复名称',
        conditions: { priceMin: 100 },
      };
      const userId = 'user123';

      searchConditionModel.findOne.mockResolvedValue({
        name: '重复名称',
      } as any);

      // 执行和断言
      await expect(
        service.saveSearchCondition(saveDto, userId),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('deleteSearchCondition', () => {
    it('应该成功删除搜索条件', async () => {
      // 安排
      const deleteDto = { conditionId: 'SC001' };
      const userId = 'user123';

      searchConditionModel.findOne.mockResolvedValue({
        conditionId: 'SC001',
        userId,
      } as any);
      searchConditionModel.deleteOne.mockResolvedValue({
        deletedCount: 1,
      } as any);

      // 执行
      await service.deleteSearchCondition(deleteDto, userId);

      // 断言
      expect(searchConditionModel.deleteOne).toHaveBeenCalledWith({
        conditionId: 'SC001',
      });
    });

    it('搜索条件不存在时应该抛出错误', async () => {
      // 安排
      const deleteDto = { conditionId: 'nonexistent' };
      const userId = 'user123';

      searchConditionModel.findOne.mockResolvedValue(null);

      // 执行和断言
      await expect(
        service.deleteSearchCondition(deleteDto, userId),
      ).rejects.toThrow(HttpException);
    });
  });
});
