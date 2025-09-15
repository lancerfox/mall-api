import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../categories.controller';
import { CategoriesService } from '../categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { QueryCategoryDto } from '../dto/query-category.dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategory = {
    _id: '507f1f77bcf86cd799439011',
    name: '水晶珠',
    description: '各种水晶材质的珠子',
    created_by: '507f1f77bcf86cd799439012',
    updated_by: '507f1f77bcf86cd799439012',
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: '507f1f77bcf86cd799439012',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建分类', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: '水晶珠',
        description: '各种水晶材质的珠子',
      };

      mockCategoriesService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(createCategoryDto, mockRequest as any);

      expect(service.create).toHaveBeenCalledWith(
        createCategoryDto,
        mockRequest.user.id,
      );
      expect(result).toEqual({
        code: 200,
        message: '分类创建成功',
        data: mockCategory,
      });
    });
  });

  describe('findAll', () => {
    it('应该返回分类列表', async () => {
      const queryDto: QueryCategoryDto = {};
      const mockResult = {
        data: [mockCategory],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockCategoriesService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(queryDto);

      expect(service.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual({
        code: 200,
        message: '获取分类列表成功',
        data: mockResult,
      });
    });
  });

  describe('findOne', () => {
    it('应该返回分类详情', async () => {
      const categoryId = '507f1f77bcf86cd799439011';

      mockCategoriesService.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne(categoryId);

      expect(service.findOne).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual({
        code: 200,
        message: '获取分类详情成功',
        data: mockCategory,
      });
    });
  });

  describe('update', () => {
    it('应该成功更新分类', async () => {
      const categoryId = '507f1f77bcf86cd799439011';
      const updateCategoryDto: UpdateCategoryDto = {
        id: categoryId,
        name: '天然水晶珠',
        description: '高品质天然水晶材质珠子',
      };

      const updatedCategory = {
        ...mockCategory,
        name: updateCategoryDto.name,
        description: updateCategoryDto.description,
      };

      mockCategoriesService.update.mockResolvedValue(updatedCategory);

      const result = await controller.update(updateCategoryDto, mockRequest as any);

      expect(service.update).toHaveBeenCalledWith(
        categoryId,
        updateCategoryDto,
        mockRequest.user.id,
      );
      expect(result).toEqual({
        code: 200,
        message: '分类更新成功',
        data: updatedCategory,
      });
    });
  });

  describe('remove', () => {
    it('应该成功删除分类', async () => {
      const categoryId = '507f1f77bcf86cd799439011';
      const mockResult = { message: '分类删除成功' };

      mockCategoriesService.remove.mockResolvedValue(mockResult);

      const result = await controller.remove({ id: categoryId });

      expect(service.remove).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual({
        code: 200,
        message: '分类删除成功',
        data: mockResult,
      });
    });
  });
});