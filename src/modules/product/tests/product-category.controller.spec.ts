import { Test, TestingModule } from '@nestjs/testing';
import { ProductCategoryController } from '../controllers/product-category.controller';
import { ProductCategoryService } from '../services/product-category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { DeleteCategoryDto } from '../dto/delete-category.dto';
import {
  ProductCategoryResponseDto,
  ProductCategoryListResponseDto,
} from '../dto/product-category-response.dto';

describe('ProductCategoryController', () => {
  let productCategoryController: ProductCategoryController;
  let categoryService: jest.Mocked<ProductCategoryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductCategoryController],
      providers: [
        {
          provide: ProductCategoryService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    productCategoryController = module.get<ProductCategoryController>(
      ProductCategoryController,
    );
    categoryService = module.get(ProductCategoryService);
  });

  describe('create', () => {
    it('应该成功创建商品分类', async () => {
      // 安排
      const createCategoryDto: CreateCategoryDto = {
        name: '电子产品',
        code: 'ELECTRONICS',
        parentId: undefined,
        sort: 0,
        enabled: true,
      };
      const createdCategoryResponse: ProductCategoryResponseDto = {
        id: 'category123',
        name: '电子产品',
        code: 'ELECTRONICS',
        level: 1,
        sort: 0,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      };

      categoryService.create.mockResolvedValue(createdCategoryResponse);

      // 执行
      const result = await productCategoryController.create(createCategoryDto);

      // 断言
      expect(result).toEqual(createdCategoryResponse);
      expect(categoryService.create).toHaveBeenCalledWith(createCategoryDto);
    });
  });

  describe('update', () => {
    it('应该成功更新商品分类', async () => {
      // 安排
      const updateCategoryDto: UpdateCategoryDto = {
        id: 'category123',
        name: '更新后的分类',
        code: 'UPDATED_CATEGORY',
        parentId: undefined,
        sort: 1,
        enabled: true,
      };
      const updatedCategoryResponse: ProductCategoryResponseDto = {
        id: 'category123',
        name: '更新后的分类',
        code: 'UPDATED_CATEGORY',
        level: 1,
        sort: 1,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      };

      categoryService.update.mockResolvedValue(updatedCategoryResponse);

      // 执行
      const result = await productCategoryController.update(updateCategoryDto);

      // 断言
      expect(result).toEqual(updatedCategoryResponse);
      expect(categoryService.update).toHaveBeenCalledWith(
        'category123',
        updateCategoryDto,
      );
    });
  });

  describe('delete', () => {
    it('应该成功删除商品分类', async () => {
      // 安排
      const deleteCategoryDto: DeleteCategoryDto = { id: 'category123' };

      categoryService.delete.mockResolvedValue();

      // 执行
      const result = await productCategoryController.delete(deleteCategoryDto);

      // 断言
      expect(result).toEqual({ message: '删除成功' });
      expect(categoryService.delete).toHaveBeenCalledWith(deleteCategoryDto);
    });
  });

  describe('list', () => {
    it('应该成功获取商品分类列表', async () => {
      // 安排
      const mockCategories: ProductCategoryResponseDto[] = [
        {
          id: '1',
          name: '电子产品',
          code: 'ELECTRONICS',
          level: 1,
          sort: 0,
          enabled: true,
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: [],
        },
        {
          id: '2',
          name: '服装',
          code: 'CLOTHING',
          level: 1,
          sort: 1,
          enabled: true,
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: [],
        },
      ];
      const expectedResponse: ProductCategoryListResponseDto = {
        data: mockCategories,
        total: 2,
        page: 1,
        pageSize: 2,
        totalPages: 1,
      };

      categoryService.findAll.mockResolvedValue(mockCategories);

      // 执行
      const result = await productCategoryController.list();

      // 断言
      expect(result).toEqual(expectedResponse);
      expect(categoryService.findAll).toHaveBeenCalled();
    });
  });

  describe('detail', () => {
    it('应该成功获取商品分类详情', async () => {
      // 安排
      const categoryId = 'category123';
      const categoryDetailResponse: ProductCategoryResponseDto = {
        id: categoryId,
        name: '电子产品',
        code: 'ELECTRONICS',
        level: 1,
        sort: 0,
        enabled: true,
        parentId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      };

      categoryService.findOne.mockResolvedValue(categoryDetailResponse);

      // 执行
      const result = await productCategoryController.detail({ id: categoryId });

      // 断言
      expect(result).toEqual(categoryDetailResponse);
      expect(categoryService.findOne).toHaveBeenCalledWith(categoryId);
    });
  });
});
