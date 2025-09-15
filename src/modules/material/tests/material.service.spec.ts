import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MaterialService } from '../services/material.service';
import { Material, MaterialDocument } from '../entities/material.entity';
import {
  Category,
  CategoryDocument,
} from '../../category/entities/category.entity';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { MaterialListDto } from '../dto/material-list.dto';
import { BatchDeleteMaterialDto } from '../dto/batch-delete-material.dto';
import { ToggleStatusDto } from '../dto/toggle-status.dto';

describe('MaterialService', () => {
  let service: MaterialService;
  let materialModel: Model<MaterialDocument>;
  let categoryModel: Model<CategoryDocument>;

  const mockMaterial = {
    materialId: 'M001',
    name: '红玛瑙',
    categoryId: 'C001',
    price: 15.5,
    stock: 100,
    description: '天然红玛瑙',
    color: '红色',
    hardness: 7,
    density: 2.65,
    status: 'enabled',
    createdBy: 'user1',
    updatedBy: 'user1',
    save: jest.fn().mockResolvedValue(this),
  };

  const mockCategory = {
    categoryId: 'C001',
    name: '宝石类',
    level: 1,
    path: '/C001',
    materialCount: 0,
  };

  const mockMaterialModel = jest.fn().mockImplementation(() => ({
    ...mockMaterial,
    save: jest.fn().mockResolvedValue(mockMaterial),
  }));

  Object.assign(mockMaterialModel, {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
    save: jest.fn(),
    lean: jest.fn(),
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
  });

  const mockCategoryModel = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialService,
        {
          provide: getModelToken(Material.name),
          useValue: mockMaterialModel,
        },
        {
          provide: getModelToken(Category.name),
          useValue: mockCategoryModel,
        },
      ],
    }).compile();

    service = module.get<MaterialService>(MaterialService);
    materialModel = module.get<Model<MaterialDocument>>(
      getModelToken(Material.name),
    );
    categoryModel = module.get<Model<CategoryDocument>>(
      getModelToken(Category.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createMaterialDto: CreateMaterialDto = {
      name: '红玛瑙',
      categoryId: 'C001',
      price: 15.5,
      stock: 100,
      description: '天然红玛瑙',
      color: '红色',
      hardness: 7,
      density: 2.65,
      status: 'enabled',
    };

    it('should create a material successfully', async () => {
      mockCategoryModel.findOne.mockResolvedValue(mockCategory);
      mockMaterialModel.findOne.mockResolvedValue(null);
      mockCategoryModel.updateOne.mockResolvedValue({ acknowledged: true });

      const result = await service.create(createMaterialDto, 'user1');

      expect(mockCategoryModel.findOne).toHaveBeenCalledWith({
        categoryId: 'C001',
      });
      expect(mockMaterialModel.findOne).toHaveBeenCalledWith({
        name: '红玛瑙',
      });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if category does not exist', async () => {
      mockCategoryModel.findOne.mockResolvedValue(null);

      await expect(service.create(createMaterialDto, 'user1')).rejects.toThrow(
        new BadRequestException('分类不存在'),
      );
    });

    it('should throw BadRequestException if material name already exists', async () => {
      mockCategoryModel.findOne.mockResolvedValue(mockCategory);
      mockMaterialModel.findOne.mockResolvedValue(mockMaterial);

      await expect(service.create(createMaterialDto, 'user1')).rejects.toThrow(
        new BadRequestException('材料名称已存在'),
      );
    });
  });

  describe('findAll', () => {
    const query: MaterialListDto = {
      page: 1,
      pageSize: 20,
      keyword: '',
      categoryId: '',
      status: '',
    };

    it('should return paginated materials list', async () => {
      const materials = [mockMaterial];
      const categories = [mockCategory];

      mockMaterialModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(materials),
            }),
          }),
        }),
      });
      mockMaterialModel.countDocuments.mockResolvedValue(1);
      mockCategoryModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(categories),
      });

      const result = await service.findAll(query);

      expect(result).toEqual({
        list: expect.any(Array),
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return a material by materialId', async () => {
      mockMaterialModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockMaterial),
      });

      const result = await service.findOne('M001');

      expect(mockMaterialModel.findOne).toHaveBeenCalledWith({
        materialId: 'M001',
      });
      expect(result).toEqual(mockMaterial);
    });

    it('should throw NotFoundException if material does not exist', async () => {
      mockMaterialModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('M999')).rejects.toThrow(
        new NotFoundException('材料不存在'),
      );
    });
  });

  describe('update', () => {
    const updateMaterialDto: UpdateMaterialDto = {
      materialId: 'M001',
      name: '蓝玛瑙',
      categoryId: 'C001',
      price: 20.0,
      stock: 80,
      status: 'enabled',
    };

    it('should update a material successfully', async () => {
      mockMaterialModel.findOne
        .mockResolvedValueOnce(mockMaterial) // 第一次调用：查找要更新的材料
        .mockResolvedValueOnce(null); // 第二次调用：检查重复名称
      mockCategoryModel.findOne.mockResolvedValue(mockCategory);
      mockMaterialModel.findOneAndUpdate.mockResolvedValue({
        ...mockMaterial,
        ...updateMaterialDto,
      });

      const result = await service.update(updateMaterialDto, 'user1');

      expect(mockMaterialModel.findOne).toHaveBeenCalledWith({
        materialId: 'M001',
      });
      expect(mockCategoryModel.findOne).toHaveBeenCalledWith({
        categoryId: 'C001',
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if material does not exist', async () => {
      mockMaterialModel.findOne.mockResolvedValue(null);

      await expect(service.update(updateMaterialDto, 'user1')).rejects.toThrow(
        new NotFoundException('材料不存在'),
      );
    });
  });

  describe('remove', () => {
    it('should remove a material successfully', async () => {
      mockMaterialModel.findOne.mockResolvedValue(mockMaterial);
      mockMaterialModel.deleteOne.mockResolvedValue({ acknowledged: true });
      mockCategoryModel.updateOne.mockResolvedValue({ acknowledged: true });

      await service.remove('M001');

      expect(mockMaterialModel.findOne).toHaveBeenCalledWith({
        materialId: 'M001',
      });
      expect(mockMaterialModel.deleteOne).toHaveBeenCalledWith({
        materialId: 'M001',
      });
    });

    it('should throw NotFoundException if material does not exist', async () => {
      mockMaterialModel.findOne.mockResolvedValue(null);

      await expect(service.remove('M999')).rejects.toThrow(
        new NotFoundException('材料不存在'),
      );
    });
  });

  describe('batchDelete', () => {
    const batchDeleteDto: BatchDeleteMaterialDto = {
      materialIds: ['M001', 'M002', 'M003'],
    };

    it('should batch delete materials', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue();

      const result = await service.batchDelete(batchDeleteDto);

      expect(result).toEqual({
        successCount: 3,
        failedCount: 0,
        failedIds: [],
      });
    });
  });

  describe('toggleStatus', () => {
    const toggleStatusDto: ToggleStatusDto = {
      materialId: 'M001',
      status: 'disabled',
    };

    it('should toggle material status successfully', async () => {
      mockMaterialModel.findOne.mockResolvedValue(mockMaterial);
      mockMaterialModel.findOneAndUpdate.mockResolvedValue({
        ...mockMaterial,
        status: 'disabled',
      });

      const result = await service.toggleStatus(toggleStatusDto, 'user1');

      expect(mockMaterialModel.findOne).toHaveBeenCalledWith({
        materialId: 'M001',
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if material does not exist', async () => {
      mockMaterialModel.findOne.mockResolvedValue(null);

      await expect(
        service.toggleStatus(toggleStatusDto, 'user1'),
      ).rejects.toThrow(new NotFoundException('材料不存在'));
    });
  });
});
