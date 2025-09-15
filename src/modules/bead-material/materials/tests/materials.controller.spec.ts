import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { MaterialsController } from '../materials.controller';
import { MaterialsService } from '../materials.service';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { QueryMaterialDto } from '../dto/query-material.dto';

describe('MaterialsController', () => {
  let controller: MaterialsController;
  let service: MaterialsService;

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
  };

  const mockMaterialsService = {
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
      controllers: [MaterialsController],
      providers: [
        {
          provide: MaterialsService,
          useValue: mockMaterialsService,
        },
      ],
    }).compile();

    controller = module.get<MaterialsController>(MaterialsController);
    service = module.get<MaterialsService>(MaterialsService);
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

      mockMaterialsService.create.mockResolvedValue(mockMaterial);

      const result = await controller.create(createMaterialDto, mockRequest as any);

      expect(service.create).toHaveBeenCalledWith(
        createMaterialDto,
        mockRequest.user.id,
      );
      expect(result).toEqual({
        code: 200,
        message: '材料创建成功',
        data: mockMaterial,
      });
    });
  });

  describe('findAll', () => {
    it('应该返回材料列表', async () => {
      const queryDto: QueryMaterialDto = {};
      const mockResult = {
        data: [mockMaterial],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockMaterialsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(queryDto);

      expect(service.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual({
        code: 200,
        message: '获取材料列表成功',
        data: mockResult,
      });
    });
  });

  describe('findOne', () => {
    it('应该返回材料详情', async () => {
      const materialId = '507f1f77bcf86cd799439011';

      mockMaterialsService.findOne.mockResolvedValue(mockMaterial);

      const result = await controller.findOne(materialId);

      expect(service.findOne).toHaveBeenCalledWith(materialId);
      expect(result).toEqual({
        code: 200,
        message: '获取材料详情成功',
        data: mockMaterial,
      });
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

      const updatedMaterial = {
        ...mockMaterial,
        name: updateMaterialDto.name,
        description: updateMaterialDto.description,
        price: updateMaterialDto.price,
      };

      mockMaterialsService.update.mockResolvedValue(updatedMaterial);

      const result = await controller.update(updateMaterialDto, mockRequest as any);

      expect(service.update).toHaveBeenCalledWith(
        materialId,
        updateMaterialDto,
        mockRequest.user.id,
      );
      expect(result).toEqual({
        code: 200,
        message: '材料更新成功',
        data: updatedMaterial,
      });
    });
  });

  describe('remove', () => {
    it('应该成功删除材料', async () => {
      const materialId = '507f1f77bcf86cd799439011';
      const mockResult = { message: '材料删除成功' };

      mockMaterialsService.remove.mockResolvedValue(mockResult);

      const result = await controller.remove({ id: materialId });

      expect(service.remove).toHaveBeenCalledWith(materialId);
      expect(result).toEqual({
        code: 200,
        message: '材料删除成功',
        data: mockResult,
      });
    });
  });
});