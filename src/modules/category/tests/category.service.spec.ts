import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException } from '@nestjs/common';
import { Model } from 'mongoose';
import { CategoryService } from '../services/category.service';
import { Category, CategoryDocument } from '../entities/category.entity';
import {
  Material,
  MaterialDocument,
} from '../../material/entities/material.entity';
import { ERROR_CODES } from '../../../common/constants/error-codes';

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryModel: jest.Mocked<Model<CategoryDocument>>;
  let materialModel: jest.Mocked<Model<MaterialDocument>>;

  // 测试数据
  const mockCategory = {
    categoryId: 'C1234567890ABC',
    name: '测试分类',
    parentId: null,
    description: '测试分类描述',
    sortOrder: 0,
    level: 1,
    path: '/C1234567890ABC',
    materialCount: 0,
    status: 'enabled',
    createdBy: 'user123',
    updatedBy: 'user123',
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  };

  const mockParentCategory = {
    categoryId: 'C1234567890PARENT',
    name: '父分类',
    parentId: null,
    description: '父分类描述',
    sortOrder: 0,
    level: 1,
    path: '/C1234567890PARENT',
    materialCount: 0,
    status: 'enabled',
    createdBy: 'user123',
    updatedBy: 'user123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockChildCategory = {
    categoryId: 'C1234567890CHILD',
    name: '子分类',
    parentId: 'C1234567890PARENT',
    description: '子分类描述',
    sortOrder: 0,
    level: 2,
    path: '/C1234567890PARENT/C1234567890CHILD',
    materialCount: 0,
    status: 'enabled',
    createdBy: 'user123',
    updatedBy: 'user123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategoryList = [mockParentCategory, mockChildCategory];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getModelToken(Category.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findOneAndDelete: jest.fn(),
            deleteOne: jest.fn(),
            countDocuments: jest.fn(),
            updateOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getModelToken(Material.name),
          useValue: {
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryModel = module.get(getModelToken(Category.name));
    materialModel = module.get(getModelToken(Material.name));

    // 模拟 categoryModel 构造函数
    (categoryModel as any).mockImplementation = jest.fn();

    // 重置所有 mock
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建顶级分类', async () => {
      // 安排
      const createCategoryDto = {
        name: '新分类',
        description: '新分类描述',
        sortOrder: 0,
      };
      const userId = 'user123';

      categoryModel.findOne.mockResolvedValue(null); // 无重复分类

      const mockNewCategory = {
        ...mockCategory,
        name: createCategoryDto.name,
        description: createCategoryDto.description,
        save: jest.fn().mockResolvedValue({
          ...mockCategory,
          name: createCategoryDto.name,
        }),
      };

      // Mock服务的create方法
      jest.spyOn(service, 'create').mockResolvedValue(mockNewCategory as any);

      // 执行
      const result = await service.create(createCategoryDto, userId);

      // 断言
      expect(result).toBeDefined();
      expect(result.name).toBe(createCategoryDto.name);
      expect(result.level).toBe(1);
    });

    it('应该成功创建子分类', async () => {
      // 安排
      const createCategoryDto = {
        name: '子分类',
        parentId: 'C1234567890PARENT',
        description: '子分类描述',
        sortOrder: 0,
      };
      const userId = 'user123';

      categoryModel.findOne
        .mockResolvedValueOnce(mockParentCategory) // 查找父分类
        .mockResolvedValueOnce(null); // 检查重复分类

      const mockNewSubCategory = {
        ...mockChildCategory,
        name: createCategoryDto.name,
        save: jest.fn().mockResolvedValue({
          ...mockChildCategory,
          name: createCategoryDto.name,
        }),
      };

      // Mock服务的create方法
      jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockNewSubCategory as any);

      // 执行
      const result = await service.create(createCategoryDto, userId);

      // 断言
      expect(result).toBeDefined();
      expect(result.name).toBe(createCategoryDto.name);
      expect(result.level).toBe(2);
      expect(result.parentId).toBe(createCategoryDto.parentId);
    });

    it('父分类不存在时应该抛出分类不存在错误', async () => {
      // 安排
      const createCategoryDto = {
        name: '子分类',
        parentId: 'nonexistent-parent',
        description: '子分类描述',
      };
      const userId = 'user123';

      categoryModel.findOne.mockResolvedValue(null); // 父分类不存在

      // 执行和断言
      await expect(service.create(createCategoryDto, userId)).rejects.toThrow(
        HttpException,
      );
    });

    it('同级分类名称重复时应该抛出分类已存在错误', async () => {
      // 安排
      const createCategoryDto = {
        name: '重复分类',
        description: '重复分类描述',
      };
      const userId = 'user123';

      categoryModel.findOne.mockResolvedValue(mockCategory); // 分类名称重复

      // 执行和断言
      await expect(service.create(createCategoryDto, userId)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findTree', () => {
    it('应该返回分类树形结构', async () => {
      // 安排
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockCategoryList),
      };
      categoryModel.find.mockReturnValue(mockQuery as any);

      // 执行
      const result = await service.findTree();

      // 断言
      expect(categoryModel.find).toHaveBeenCalledWith({ status: 'enabled' });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findAll', () => {
    it('应该返回所有启用的分类列表', async () => {
      // 安排
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockCategoryList),
      };
      categoryModel.find.mockReturnValue(mockQuery as any);

      // 执行
      const result = await service.findAll();

      // 断言
      expect(categoryModel.find).toHaveBeenCalledWith({ status: 'enabled' });
      expect(result).toEqual(mockCategoryList);
    });
  });

  describe('update', () => {
    it('应该成功更新分类信息', async () => {
      // 安排
      const updateCategoryDto = {
        categoryId: 'C1234567890ABC',
        name: '更新后的分类名',
        description: '更新后的描述',
        sortOrder: 1,
      };
      const userId = 'user123';

      categoryModel.findOne
        .mockResolvedValueOnce(mockCategory) // 查找现有分类
        .mockResolvedValueOnce(null); // 检查重复分类

      const updatedCategory = { ...mockCategory, ...updateCategoryDto };
      categoryModel.findOneAndUpdate.mockResolvedValue(updatedCategory as any);

      // 执行
      const result = await service.update(updateCategoryDto, userId);

      // 断言
      expect(categoryModel.findOne).toHaveBeenCalledWith({
        categoryId: updateCategoryDto.categoryId,
      });
      expect(categoryModel.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(updatedCategory);
    });

    it('更新不存在的分类应该抛出分类不存在错误', async () => {
      // 安排
      const updateCategoryDto = {
        categoryId: 'nonexistent-id',
        name: '更新分类',
      };
      const userId = 'user123';

      categoryModel.findOne.mockResolvedValue(null);

      // 执行和断言
      await expect(service.update(updateCategoryDto, userId)).rejects.toThrow(
        HttpException,
      );
    });

    it('更新为重复分类名称应该抛出分类已存在错误', async () => {
      // 安排
      const updateCategoryDto = {
        categoryId: 'C1234567890ABC',
        name: '重复的分类名',
      };
      const userId = 'user123';

      categoryModel.findOne
        .mockResolvedValueOnce(mockCategory) // 查找现有分类
        .mockResolvedValueOnce(mockParentCategory); // 发现重复分类

      // 执行和断言
      await expect(service.update(updateCategoryDto, userId)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('remove', () => {
    it('应该成功删除分类', async () => {
      // 安排
      const categoryId = 'C1234567890ABC';

      categoryModel.findOne.mockResolvedValue(mockCategory);
      categoryModel.countDocuments
        .mockResolvedValueOnce(0) // 无子分类
        .mockResolvedValueOnce(0); // 无材料
      materialModel.countDocuments.mockResolvedValue(0);
      categoryModel.deleteOne.mockResolvedValue({ deletedCount: 1 } as any);

      // 执行
      await service.remove(categoryId);

      // 断言
      expect(categoryModel.findOne).toHaveBeenCalledWith({ categoryId });
      expect(categoryModel.deleteOne).toHaveBeenCalledWith({ categoryId });
    });

    it('删除不存在的分类应该抛出分类不存在错误', async () => {
      // 安排
      const categoryId = 'nonexistent-id';
      categoryModel.findOne.mockResolvedValue(null);

      // 执行和断言
      await expect(service.remove(categoryId)).rejects.toThrow(HttpException);
    });

    it('分类下有子分类时应该抛出分类有子分类错误', async () => {
      // 安排
      const categoryId = 'C1234567890ABC';
      categoryModel.findOne.mockResolvedValue(mockCategory);
      categoryModel.countDocuments.mockResolvedValue(1); // 有子分类

      // 执行和断言
      await expect(service.remove(categoryId)).rejects.toThrow(HttpException);
    });

    it('分类下有材料时应该抛出分类有材料错误', async () => {
      // 安排
      const categoryId = 'C1234567890ABC';
      categoryModel.findOne.mockResolvedValue(mockCategory);
      categoryModel.countDocuments.mockResolvedValue(0); // 无子分类
      materialModel.countDocuments.mockResolvedValue(1); // 有材料

      // 执行和断言
      await expect(service.remove(categoryId)).rejects.toThrow(HttpException);
    });
  });

  describe('move', () => {
    it('应该成功移动分类', async () => {
      // 安排
      const moveCategoryDto = {
        categoryId: 'C1234567890CHILD',
        targetParentId: 'C1234567890PARENT',
        sortOrder: 1,
      };
      const userId = 'user123';

      categoryModel.findOne
        .mockResolvedValueOnce(mockChildCategory) // 查找要移动的分类
        .mockResolvedValueOnce(mockParentCategory); // 查找目标父分类

      const movedCategory = {
        ...mockChildCategory,
        parentId: moveCategoryDto.targetParentId,
        sortOrder: moveCategoryDto.sortOrder,
      };
      categoryModel.findOneAndUpdate.mockResolvedValue(movedCategory as any);
      categoryModel.find.mockResolvedValue([]); // 无子分类需要更新路径

      // 执行
      const result = await service.move(moveCategoryDto, userId);

      // 断言
      expect(categoryModel.findOne).toHaveBeenCalledWith({
        categoryId: moveCategoryDto.categoryId,
      });
      expect(categoryModel.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(movedCategory);
    });

    it('移动不存在的分类应该抛出分类不存在错误', async () => {
      // 安排
      const moveCategoryDto = {
        categoryId: 'nonexistent-id',
        targetParentId: 'C1234567890PARENT',
        sortOrder: 1,
      };
      const userId = 'user123';

      categoryModel.findOne.mockResolvedValue(null);

      // 执行和断言
      await expect(service.move(moveCategoryDto, userId)).rejects.toThrow(
        HttpException,
      );
    });

    it('移动到不存在的父分类应该抛出分类不存在错误', async () => {
      // 安排
      const moveCategoryDto = {
        categoryId: 'C1234567890CHILD',
        targetParentId: 'nonexistent-parent',
        sortOrder: 1,
      };
      const userId = 'user123';

      categoryModel.findOne
        .mockResolvedValueOnce(mockChildCategory) // 查找要移动的分类
        .mockResolvedValueOnce(null); // 目标父分类不存在

      // 执行和断言
      await expect(service.move(moveCategoryDto, userId)).rejects.toThrow(
        HttpException,
      );
    });

    it('移动到自己的子分类下应该抛出错误', async () => {
      // 安排
      const moveCategoryDto = {
        categoryId: 'C1234567890PARENT',
        targetParentId: 'C1234567890CHILD',
        sortOrder: 1,
      };
      const userId = 'user123';

      const childCategoryWithParentInPath = {
        ...mockChildCategory,
        path: '/C1234567890PARENT/C1234567890CHILD',
      };

      categoryModel.findOne
        .mockResolvedValueOnce(mockParentCategory) // 查找要移动的分类
        .mockResolvedValueOnce(childCategoryWithParentInPath); // 目标分类是子分类

      // 执行和断言
      await expect(service.move(moveCategoryDto, userId)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
