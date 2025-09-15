import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MaterialsService } from '../materials.service';
import { BeadMaterial, BeadMaterialDocument } from '../schemas/material.schema';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { QueryMaterialDto } from '../dto/query-material.dto';

describe('MaterialsService', () => {
  let service: MaterialsService;
  let model: Model<BeadMaterialDocument>;

  const mockMaterial = {
    _id: '507f1f77bcf86cd799439011',
    name: '天然水晶',
    category_id: '507f1f77bcf86cd799439013',
    description: '高品质天然水晶材料',
    color: '透明',
    size: '8mm',
    shape: '圆形',
    texture: '光滑',
    hardness: '7',
    transparency: '透明',
    origin: '巴西',
    price: 15.50,
    stock_quantity: 100,
    unit: '颗',
    supplier: '水晶供应商',
    purchase_date: new Date('2024-01-01'),
    created_by: '507f1f77bcf86cd799439012',
    updated_by: '507f1f77bcf86cd799439012',
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-01T00:00:00.000Z'),
    save: jest.fn().mockResolvedValue(this),
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      name: '天然水晶',
      category_id: '507f1f77bcf86cd799439013',
      description: '高品质天然水晶材料',
      color: '透明',
      size: '8mm',
      shape: '圆形',
      texture: '光滑',
      hardness: '7',
      transparency: '透明',
      origin: '巴西',
      price: 15.50,
      stock_quantity: 100,
      unit: '颗',
      supplier: '水晶供应商',
      purchase_date: new Date('2024-01-01'),
      created_by: '507f1f77bcf86cd799439012',
      updated_by: '507f1f77bcf86cd799439012',
      created_at: new Date('2024-01-01T00:00:00.000Z'),
      updated_at: new Date('2024-01-01T00:00:00.000Z'),
    }),
  };

  const mockModel = {
    new: jest.fn().mockResolvedValue(mockMaterial),
    constructor: jest.fn().mockResolvedValue(mockMaterial),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    exec: jest.fn(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialsService,
        {
          provide: getModelToken('BeadMaterial'),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<MaterialsService>(MaterialsService);
    model = module.get<Model<BeadMaterialDocument>>(getModelToken('BeadMaterial'));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建材料', async () => {
      const createMaterialDto: CreateMaterialDto = {
        name: '天然水晶',
        category_id: '507f1f77bcf86cd799439013',
        description: '高品质天然水晶材料',
        color: '透明',
        size: '8mm',
        shape: '圆形',
        texture: '光滑',
        hardness: '7',
        transparency: '透明',
        origin: '巴西',
        price: 15.50,
        stock_quantity: 100,
        unit: '颗',
        supplier: '水晶供应商',
        purchase_date: new Date('2024-01-01'),
      };

      const userId = '507f1f77bcf86cd799439012';

      mockModel.findOne.mockResolvedValue(null);
      mockModel.create.mockResolvedValue(mockMaterial);

      const result = await service.create(createMaterialDto, userId);

      expect(model.findOne).toHaveBeenCalledWith({ 
        name: '天然水晶',
        category_id: '507f1f77bcf86cd799439013'
      });
      expect(model.create).toHaveBeenCalledWith({
        ...createMaterialDto,
        created_by: userId,
      });
      expect(result).toEqual(mockMaterial);
    });

    it('创建材料时应该处理重复名称', async () => {
      const createMaterialDto: CreateMaterialDto = {
        name: '天然水晶',
        category_id: '507f1f77bcf86cd799439013',
        description: '高品质天然水晶材料',
        color: '透明',
        size: '8mm',
        shape: '圆形',
        texture: '光滑',
        hardness: '7',
        transparency: '透明',
        origin: '巴西',
        price: 15.50,
        stock_quantity: 100,
        unit: '颗',
        supplier: '水晶供应商',
        purchase_date: new Date('2024-01-01'),
      };

      const userId = '507f1f77bcf86cd799439012';

      mockModel.findOne.mockResolvedValue(mockMaterial);

      await expect(
        service.create(createMaterialDto, userId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('应该返回分页的材料列表', async () => {
      const queryDto: QueryMaterialDto = {};

      const mockMaterials = [mockMaterial];
      const mockTotal = 1;

      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockMaterials),
      });
      mockModel.countDocuments.mockResolvedValue(mockTotal);

      const result = await service.findAll(queryDto);

      expect(result).toEqual({
        data: mockMaterials,
        total: mockTotal,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('应该支持关键词搜索', async () => {
      const queryDto: QueryMaterialDto = {
        keyword: '水晶',
      };

      const mockMaterials = [mockMaterial];
      const mockTotal = 1;

      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockMaterials),
      });
      mockModel.countDocuments.mockResolvedValue(mockTotal);

      const result = await service.findAll(queryDto);

      expect(model.find).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: '水晶', $options: 'i' } },
          { description: { $regex: '水晶', $options: 'i' } },
        ],
      });
      expect(result.data).toEqual(mockMaterials);
    });

    it('应该支持分类筛选', async () => {
      const queryDto: QueryMaterialDto = {
        category_id: '507f1f77bcf86cd799439013',
      };

      const mockMaterials = [mockMaterial];
      const mockTotal = 1;

      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockMaterials),
      });
      mockModel.countDocuments.mockResolvedValue(mockTotal);

      const result = await service.findAll(queryDto);

      expect(model.find).toHaveBeenCalledWith({ category_id: '507f1f77bcf86cd799439013' });
      expect(result.data).toEqual(mockMaterials);
    });
  });

  describe('findOne', () => {
    it('应该成功获取材料详情', async () => {
      const materialId = '507f1f77bcf86cd799439011';

      mockModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockMaterial),
      });

      const result = await service.findOne(materialId);

      expect(model.findById).toHaveBeenCalledWith(materialId);
      expect(result).toEqual(mockMaterial);
    });

    it('获取材料详情时应该处理材料不存在', async () => {
      const materialId = 'nonexistent';

      mockModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(materialId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('应该成功更新材料', async () => {
      const materialId = '507f1f77bcf86cd799439011';
      const updateMaterialDto: UpdateMaterialDto = {
        id: materialId,
        name: '优质天然水晶',
        description: '超高品质天然水晶材料',
        price: 18.50,
      };
      const userId = '507f1f77bcf86cd799439012';

      const updatedMaterial = {
        ...mockMaterial,
        name: updateMaterialDto.name,
        description: updateMaterialDto.description,
        price: updateMaterialDto.price,
        updated_by: userId,
      };

      mockModel.findById.mockResolvedValue(mockMaterial);
      mockModel.findOne.mockResolvedValue(null);
      mockModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(updatedMaterial),
      });

      const result = await service.update(materialId, updateMaterialDto, userId);

      expect(model.findById).toHaveBeenCalledWith(materialId);
      expect(result).toEqual(updatedMaterial);
    });

    it('更新材料时应该处理材料不存在', async () => {
      const materialId = 'nonexistent';
      const updateMaterialDto: UpdateMaterialDto = {
        id: materialId,
        name: '优质天然水晶',
      };
      const userId = '507f1f77bcf86cd799439012';

      mockModel.findById.mockResolvedValue(null);

      await expect(
        service.update(materialId, updateMaterialDto, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('应该成功删除材料', async () => {
      const materialId = '507f1f77bcf86cd799439011';

      mockModel.findById.mockResolvedValue(mockMaterial);
      mockModel.findByIdAndDelete.mockResolvedValue(mockMaterial);

      const result = await service.remove(materialId);

      expect(model.findById).toHaveBeenCalledWith(materialId);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(materialId);
      expect(result).toEqual({ message: '材料删除成功' });
    });

    it('删除材料时应该处理材料不存在', async () => {
      const materialId = 'nonexistent';

      mockModel.findById.mockResolvedValue(null);

      await expect(service.remove(materialId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});