import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CategoriesService } from '../categories.service';
import { BeadCategory, BeadCategoryDocument } from '../schemas/category.schema';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { QueryCategoryDto } from '../dto/query-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let model: Model<BeadCategoryDocument>;

  const mockCategory = {
    _id: '507f1f77bcf86cd799439011',
    name: '水晶珠',
    description: '各种水晶材质的珠子',
    created_by: '507f1f77bcf86cd799439012',
    updated_by: '507f1f77bcf86cd799439012',
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-01T00:00:00.000Z'),
    save: jest.fn().mockResolvedValue(this),
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      name: '水晶珠',
      description: '各种水晶材质的珠子',
      created_by: '507f1f77bcf86cd799439012',
      updated_by: '507f1f77bcf86cd799439012',
      created_at: new Date('2024-01-01T00:00:00.000Z'),
      updated_at: new Date('2024-01-01T00:00:00.000Z'),
    }),
  };

  const mockModel = {
    new: jest.fn().mockResolvedValue(mockCategory),
    constructor: jest.fn().mockResolvedValue(mockCategory),
    find: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockCategory]),
    }),
    findOne: jest.fn(),
    findById: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCategory),
      }),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockCategory),
    }),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    exec: jest.fn(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken('BeadCategory'),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    model = module.get<Model<BeadCategoryDocument>>(getModelToken('BeadCategory'));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建分类', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: '水晶珠',
        description: '各种水晶材质的珠子',
      };

      const userId = '507f1f77bcf86cd799439012';

      mockModel.findOne.mockResolvedValue(null);
      mockModel.create.mockResolvedValue(mockCategory);

      const result = await service.create(createCategoryDto, userId);

      expect(model.findOne).toHaveBeenCalledWith({ name: '水晶珠' });
      expect(model.create).toHaveBeenCalledWith({
        ...createCategoryDto,
        created_by: userId,
      });
      expect(result).toEqual(mockCategory);
    });

    it('创建分类时应该处理重复名称', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: '水晶珠',
        description: '各种水晶材质的珠子',
      };

      const userId = '507f1f77bcf86cd799439012';

      mockModel.findOne.mockResolvedValue(mockCategory);

      await expect(
        service.create(createCategoryDto, userId),
      ).rejects.toThrow(ConflictException);
      expect(model.findOne).toHaveBeenCalledWith({ name: '水晶珠' });
    });
  });

  describe('findAll', () => {
    it('应该返回分页的分类列表', async () => {
      const queryDto: QueryCategoryDto = {};

      const mockCategories = [mockCategory];
      const mockTotal = 1;

      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCategories),
      });
      mockModel.countDocuments.mockResolvedValue(mockTotal);

      const result = await service.findAll(queryDto);

      expect(result).toEqual({
        data: mockCategories,
        total: mockTotal,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('应该支持关键词搜索', async () => {
      const queryDto: QueryCategoryDto = {
        keyword: '水晶',
      };

      const mockCategories = [mockCategory];
      const mockTotal = 1;

      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCategories),
      });
      mockModel.countDocuments.mockResolvedValue(mockTotal);

      const result = await service.findAll(queryDto);

      expect(model.find).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: '水晶', $options: 'i' } },
          { description: { $regex: '水晶', $options: 'i' } },
        ],
      });
      expect(result.data).toEqual(mockCategories);
    });
  });

  describe('findOne', () => {
    it('应该成功获取分类详情', async () => {
      const categoryId = '507f1f77bcf86cd799439011';

      mockModel.findById.mockResolvedValue(mockCategory);

      const result = await service.findOne(categoryId);

      expect(model.findById).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(mockCategory);
    });

    it('获取分类详情时应该处理分类不存在', async () => {
      const categoryId = 'nonexistent';

      mockModel.findById.mockResolvedValue(null);

      await expect(service.findOne(categoryId)).rejects.toThrow(
        BadRequestException,
      );
      expect(model.findById).toHaveBeenCalledWith(categoryId);
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
      const userId = '507f1f77bcf86cd799439012';

      const updatedCategory = {
        ...mockCategory,
        name: updateCategoryDto.name,
        description: updateCategoryDto.description,
        updated_by: userId,
      };

      mockModel.findById.mockResolvedValue(mockCategory);
      mockModel.findOne.mockResolvedValue(null);
      mockModel.findByIdAndUpdate.mockResolvedValue(updatedCategory);

      const result = await service.update(categoryId, updateCategoryDto, userId);

      expect(model.findById).toHaveBeenCalledWith(categoryId);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        categoryId,
        { name: updateCategoryDto.name, description: updateCategoryDto.description, updated_by: userId },
        { new: true },
      );
      expect(result).toEqual(updatedCategory);
    });

    it('更新分类时应该处理分类不存在', async () => {
      const categoryId = 'nonexistent';
      const updateCategoryDto: UpdateCategoryDto = {
        id: categoryId,
        name: '天然水晶珠',
      };
      const userId = '507f1f77bcf86cd799439012';

      mockModel.findById.mockResolvedValue(null);

      await expect(
        service.update(categoryId, updateCategoryDto, userId),
      ).rejects.toThrow(BadRequestException);
      expect(model.findById).toHaveBeenCalledWith(categoryId);
    });
  });

  describe('remove', () => {
    it('应该成功删除分类', async () => {
      const categoryId = '507f1f77bcf86cd799439011';

      mockModel.findById.mockResolvedValue(mockCategory);
      mockModel.countDocuments.mockResolvedValue(0); // 没有子分类
      mockModel.findByIdAndDelete.mockResolvedValue(mockCategory);

      const result = await service.remove(categoryId);

      expect(model.findById).toHaveBeenCalledWith(categoryId);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual({ message: '分类删除成功' });
    });

    it('删除分类时应该处理分类不存在', async () => {
      const categoryId = 'nonexistent';

      mockModel.findById.mockResolvedValue(null);

      await expect(service.remove(categoryId)).rejects.toThrow(
        BadRequestException,
      );
      expect(model.findById).toHaveBeenCalledWith(categoryId);
    });
  });
});