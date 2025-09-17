import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from '../services/category.service';
import { ERROR_CODES } from '../../../common/constants/error-codes';

describe('CategoryController', () => {
  let controller: CategoryController;
  let categoryService: jest.Mocked<CategoryService>;

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
  };

  const mockCategoryTree = [
    {
      categoryId: 'C1234567890PARENT',
      name: '父分类',
      parentId: null,
      description: '父分类描述',
      sortOrder: 0,
      level: 1,
      materialCount: 0,
      status: 'enabled',
      children: [
        {
          categoryId: 'C1234567890CHILD',
          name: '子分类',
          parentId: 'C1234567890PARENT',
          description: '子分类描述',
          sortOrder: 0,
          level: 2,
          materialCount: 0,
          status: 'enabled',
          children: [],
        },
      ],
    },
  ];

  const mockCategoryList = [
    {
      categoryId: 'C1234567890PARENT',
      name: '父分类',
      parentId: null,
      level: 1,
      path: '/C1234567890PARENT',
    },
    {
      categoryId: 'C1234567890CHILD',
      name: '子分类',
      parentId: 'C1234567890PARENT',
      level: 2,
      path: '/C1234567890PARENT/C1234567890CHILD',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            findTree: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            move: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    categoryService = module.get(CategoryService);

    // 重置所有 mock
    jest.clearAllMocks();
  });

  describe('tree', () => {
    it('应该返回分类树形结构', async () => {
      // 安排
      categoryService.findTree.mockResolvedValue(mockCategoryTree);

      // 执行
      const result = await controller.tree();

      // 断言
      expect(categoryService.findTree).toHaveBeenCalled();
      expect(result).toEqual(mockCategoryTree);
      expect(result[0].children).toBeDefined();
      expect(result[0].children).toHaveLength(1);
    });
  });

  describe('listAll', () => {
    it('应该返回所有分类列表', async () => {
      // 安排
      categoryService.findAll.mockResolvedValue(mockCategoryList);

      // 执行
      const result = await controller.listAll();

      // 断言
      expect(categoryService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCategoryList);
      expect(result).toHaveLength(2);
    });
  });

  describe('create', () => {
    it('应该成功创建分类', async () => {
      // 安排
      const createCategoryDto = {
        name: '新分类',
        description: '新分类描述',
        sortOrder: 0,
      };
      const userId = 'user123';

      categoryService.create.mockResolvedValue(mockCategory as any);

      // 执行
      const result = await controller.create(createCategoryDto, userId);

      // 断言
      expect(categoryService.create).toHaveBeenCalledWith(
        createCategoryDto,
        userId,
      );
      expect(result).toEqual({ categoryId: mockCategory.categoryId });
    });

    it('重复分类名称应该传递服务层的错误', async () => {
      // 安排
      const createCategoryDto = {
        name: '重复分类',
        description: '描述',
      };
      const userId = 'user123';

      const expectedError = new HttpException(
        '同级分类名称不能重复',
        ERROR_CODES.CATEGORY_ALREADY_EXISTS,
      );
      categoryService.create.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(
        controller.create(createCategoryDto, userId),
      ).rejects.toThrow(expectedError);
    });

    it('父分类不存在应该传递服务层的错误', async () => {
      // 安排
      const createCategoryDto = {
        name: '新分类',
        parentId: 'nonexistent-parent',
        description: '描述',
      };
      const userId = 'user123';

      const expectedError = new HttpException(
        '父分类不存在',
        ERROR_CODES.CATEGORY_NOT_FOUND,
      );
      categoryService.create.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(
        controller.create(createCategoryDto, userId),
      ).rejects.toThrow(expectedError);
    });
  });

  describe('update', () => {
    it('应该成功更新分类信息', async () => {
      // 安排
      const updateCategoryDto = {
        categoryId: 'C1234567890ABC',
        name: '更新后的分类名',
        description: '更新后的描述',
      };
      const userId = 'user123';

      const updatedCategory = { ...mockCategory, ...updateCategoryDto };
      categoryService.update.mockResolvedValue(updatedCategory as any);

      // 执行
      const result = await controller.update(updateCategoryDto, userId);

      // 断言
      expect(categoryService.update).toHaveBeenCalledWith(
        updateCategoryDto,
        userId,
      );
      expect(result).toEqual({ success: true, message: '更新成功' });
    });

    it('更新不存在的分类应该传递服务层的错误', async () => {
      // 安排
      const updateCategoryDto = {
        categoryId: 'nonexistent-id',
        name: '更新分类',
      };
      const userId = 'user123';

      const expectedError = new HttpException(
        '分类不存在',
        ERROR_CODES.CATEGORY_NOT_FOUND,
      );
      categoryService.update.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(
        controller.update(updateCategoryDto, userId),
      ).rejects.toThrow(expectedError);
    });
  });

  describe('delete', () => {
    it('应该成功删除分类', async () => {
      // 安排
      const deleteCategoryDto = { categoryId: 'C1234567890ABC' };
      categoryService.remove.mockResolvedValue(undefined);

      // 执行
      const result = await controller.delete(deleteCategoryDto);

      // 断言
      expect(categoryService.remove).toHaveBeenCalledWith(
        deleteCategoryDto.categoryId,
      );
      expect(result).toEqual({ success: true, message: '删除成功' });
    });

    it('删除不存在的分类应该传递服务层的错误', async () => {
      // 安排
      const deleteCategoryDto = { categoryId: 'nonexistent-id' };
      const expectedError = new HttpException(
        '分类不存在',
        ERROR_CODES.CATEGORY_NOT_FOUND,
      );
      categoryService.remove.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.delete(deleteCategoryDto)).rejects.toThrow(
        expectedError,
      );
    });

    it('分类下有子分类时应该传递服务层的错误', async () => {
      // 安排
      const deleteCategoryDto = { categoryId: 'C1234567890PARENT' };
      const expectedError = new HttpException(
        '分类下存在子分类，无法删除',
        ERROR_CODES.CATEGORY_HAS_CHILDREN,
      );
      categoryService.remove.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.delete(deleteCategoryDto)).rejects.toThrow(
        expectedError,
      );
    });

    it('分类下有材料时应该传递服务层的错误', async () => {
      // 安排
      const deleteCategoryDto = { categoryId: 'C1234567890ABC' };
      const expectedError = new HttpException(
        '分类下存在材料，无法删除',
        ERROR_CODES.CATEGORY_HAS_MATERIALS,
      );
      categoryService.remove.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.delete(deleteCategoryDto)).rejects.toThrow(
        expectedError,
      );
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

      const movedCategory = {
        ...mockCategory,
        parentId: moveCategoryDto.targetParentId,
        sortOrder: moveCategoryDto.sortOrder,
      };
      categoryService.move.mockResolvedValue(movedCategory as any);

      // 执行
      const result = await controller.move(moveCategoryDto, userId);

      // 断言
      expect(categoryService.move).toHaveBeenCalledWith(
        moveCategoryDto,
        userId,
      );
      expect(result).toEqual({ success: true, message: '移动成功' });
    });

    it('移动不存在的分类应该传递服务层的错误', async () => {
      // 安排
      const moveCategoryDto = {
        categoryId: 'nonexistent-id',
        targetParentId: 'C1234567890PARENT',
        sortOrder: 1,
      };
      const userId = 'user123';

      const expectedError = new HttpException(
        '分类不存在',
        ERROR_CODES.CATEGORY_NOT_FOUND,
      );
      categoryService.move.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.move(moveCategoryDto, userId)).rejects.toThrow(
        expectedError,
      );
    });

    it('移动到不存在的父分类应该传递服务层的错误', async () => {
      // 安排
      const moveCategoryDto = {
        categoryId: 'C1234567890CHILD',
        targetParentId: 'nonexistent-parent',
        sortOrder: 1,
      };
      const userId = 'user123';

      const expectedError = new HttpException(
        '目标父分类不存在',
        ERROR_CODES.CATEGORY_NOT_FOUND,
      );
      categoryService.move.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.move(moveCategoryDto, userId)).rejects.toThrow(
        expectedError,
      );
    });

    it('移动到自己的子分类下应该传递服务层的错误', async () => {
      // 安排
      const moveCategoryDto = {
        categoryId: 'C1234567890PARENT',
        targetParentId: 'C1234567890CHILD',
        sortOrder: 1,
      };
      const userId = 'user123';

      const expectedError = new HttpException(
        '不能将分类移动到自己的子分类下',
        ERROR_CODES.CATEGORY_CANNOT_MOVE_TO_SELF,
      );
      categoryService.move.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.move(moveCategoryDto, userId)).rejects.toThrow(
        expectedError,
      );
    });
  });
});
