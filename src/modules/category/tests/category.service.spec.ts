import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { Category, CategoryDocument } from '../entities/category.entity';
import {
  Material,
  MaterialDocument,
} from '../../material/entities/material.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { MoveCategoryDto } from '../dto/move-category.dto';

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryModel: Model<CategoryDocument>;
  let materialModel: Model<MaterialDocument>;

  const mockCategory = {
    categoryId: 'C001',
    name: '宝石类',
    parentId: null,
    description: '各种宝石材料',
    sortOrder: 1,
    level: 1,
    path: '/C001',
    materialCount: 0,
    status: 'enabled',
    createdBy: 'user1',
    updatedBy: 'user1',
    save: jest.fn().mockResolvedValue(this),
  };

  const mockCategoryModel = jest.fn().mockImplementation(() => ({
    ...mockCategory,
    save: jest.fn().mockResolvedValue(mockCategory),
  }));

  Object.assign(mockCategoryModel, {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
    updateOne: jest.fn(),
    lean: jest.fn(),
    sort: jest.fn(),
    select: jest.fn(),
  });

  const mockMaterialModel = {
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getModelToken(Category.name),
          useValue: mockCategoryModel,
        },
        {
          provide: getModelToken(Material.name),
          useValue: mockMaterialModel,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryModel = module.get<Model<CategoryDocument>>(
      getModelToken(Category.name),
    );
    materialModel = module.get<Model<MaterialDocument>>(
      getModelToken(Material.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCategoryDto: CreateCategoryDto = {
      name: '水晶类',
      parentId: 'C001',
      description: '各种水晶材料',
      sortOrder: 1,
    };

    it('should create a category successfully', async () => {
      const parentCategory = {
        ...mockCategory,
        categoryId: 'C001',
        level: 1,
        path: '/C001',
      };
      mockCategoryModel.findOne
        .mockResolvedValueOnce(parentCategory) // 查找父分类
        .mockResolvedValueOnce(null); // 检查重复名称

      const result = await service.create(createCategoryDto, 'user1');

      expect(mockCategoryModel.findOne).toHaveBeenCalledWith({
        categoryId: 'C001',
      });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if parent category does not exist', async () => {
      mockCategoryModel.findOne.mockResolvedValue(null);

      await expect(service.create(createCategoryDto, 'user1')).rejects.toThrow(
        new BadRequestException('父分类不存在'),
      );
    });

    it('should throw BadRequestException if category name already exists at same level', async () => {
      const parentCategory = { ...mockCategory, categoryId: 'C001' };
      mockCategoryModel.findOne
        .mockResolvedValueOnce(parentCategory) // 查找父分类
        .mockResolvedValueOnce(mockCategory); // 检查重复名称

      await expect(service.create(createCategoryDto, 'user1')).rejects.toThrow(
        new BadRequestException('同级分类名称不能重复'),
      );
    });
  });

  describe('findTree', () => {
    it('should return category tree structure', async () => {
      const categories = [
        { ...mockCategory, categoryId: 'C001', parentId: null },
        { ...mockCategory, categoryId: 'C002', parentId: 'C001' },
      ];

      mockCategoryModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(categories),
        }),
      });

      const result = await service.findTree();

      expect(result).toBeInstanceOf(Array);
      expect(mockCategoryModel.find).toHaveBeenCalledWith({
        status: 'enabled',
      });
    });
  });

  describe('findAll', () => {
    it('should return all categories list', async () => {
      const categories = [mockCategory];

      mockCategoryModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(categories),
          }),
        }),
      });

      const result = await service.findAll();

      expect(result).toEqual(categories);
      expect(mockCategoryModel.find).toHaveBeenCalledWith({
        status: 'enabled',
      });
    });
  });

  describe('update', () => {
    const updateCategoryDto: UpdateCategoryDto = {
      categoryId: 'C001',
      name: '珍珠类',
      parentId: null,
      description: '各种珍珠材料',
      sortOrder: 2,
    };

    it('should update a category successfully', async () => {
      mockCategoryModel.findOne
        .mockResolvedValueOnce(mockCategory) // 第一次调用：查找要更新的分类
        .mockResolvedValueOnce(null); // 第二次调用：检查重复名称
      mockCategoryModel.findOneAndUpdate.mockResolvedValue({
        ...mockCategory,
        ...updateCategoryDto,
      });

      const result = await service.update(updateCategoryDto, 'user1');

      expect(mockCategoryModel.findOne).toHaveBeenCalledWith({
        categoryId: 'C001',
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockCategoryModel.findOne.mockResolvedValue(null);

      await expect(service.update(updateCategoryDto, 'user1')).rejects.toThrow(
        new NotFoundException('分类不存在'),
      );
    });
  });

  describe('remove', () => {
    it('should remove a category successfully', async () => {
      mockCategoryModel.findOne.mockResolvedValue(mockCategory);
      mockCategoryModel.countDocuments.mockResolvedValue(0);
      mockMaterialModel.countDocuments.mockResolvedValue(0);
      mockCategoryModel.deleteOne.mockResolvedValue({ acknowledged: true });

      await service.remove('C001');

      expect(mockCategoryModel.findOne).toHaveBeenCalledWith({
        categoryId: 'C001',
      });
      expect(mockCategoryModel.deleteOne).toHaveBeenCalledWith({
        categoryId: 'C001',
      });
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockCategoryModel.findOne.mockResolvedValue(null);

      await expect(service.remove('C999')).rejects.toThrow(
        new NotFoundException('分类不存在'),
      );
    });

    it('should throw BadRequestException if category has children', async () => {
      mockCategoryModel.findOne.mockResolvedValue(mockCategory);
      mockCategoryModel.countDocuments.mockResolvedValue(1);

      await expect(service.remove('C001')).rejects.toThrow(
        new BadRequestException('分类下存在子分类，无法删除'),
      );
    });

    it('should throw BadRequestException if category has materials', async () => {
      mockCategoryModel.findOne.mockResolvedValue(mockCategory);
      mockCategoryModel.countDocuments.mockResolvedValue(0);
      mockMaterialModel.countDocuments.mockResolvedValue(1);

      await expect(service.remove('C001')).rejects.toThrow(
        new BadRequestException('分类下存在材料，无法删除'),
      );
    });
  });

  describe('move', () => {
    const moveCategoryDto: MoveCategoryDto = {
      categoryId: 'C002',
      targetParentId: 'C001',
      sortOrder: 1,
    };

    it('should move a category successfully', async () => {
      const category = { ...mockCategory, categoryId: 'C002' };
      const targetParent = {
        ...mockCategory,
        categoryId: 'C001',
        path: '/C001',
      };

      mockCategoryModel.findOne
        .mockResolvedValueOnce(category) // 查找要移动的分类
        .mockResolvedValueOnce(targetParent); // 查找目标父分类
      mockCategoryModel.findOneAndUpdate.mockResolvedValue({
        ...category,
        parentId: 'C001',
      });
      mockCategoryModel.find.mockResolvedValue([]);

      const result = await service.move(moveCategoryDto, 'user1');

      expect(mockCategoryModel.findOne).toHaveBeenCalledWith({
        categoryId: 'C002',
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockCategoryModel.findOne.mockResolvedValue(null);

      await expect(service.move(moveCategoryDto, 'user1')).rejects.toThrow(
        new NotFoundException('分类不存在'),
      );
    });

    it('should throw BadRequestException if trying to move to own child', async () => {
      const category = { ...mockCategory, categoryId: 'C001', path: '/C001' };
      const targetParent = {
        ...mockCategory,
        categoryId: 'C002',
        path: '/C001/C002',
      };

      mockCategoryModel.findOne
        .mockResolvedValueOnce(category)
        .mockResolvedValueOnce(targetParent);

      await expect(
        service.move(
          { ...moveCategoryDto, categoryId: 'C001', targetParentId: 'C002' },
          'user1',
        ),
      ).rejects.toThrow(
        new BadRequestException('不能将分类移动到自己的子分类下'),
      );
    });
  });
});
