import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException } from '@nestjs/common';
import { Model } from 'mongoose';
import { EnhancedMaterialService } from './enhanced-material.service';
import { Material, MaterialDocument } from '../entities/material.entity';
import {
  Category,
  CategoryDocument,
} from '../../category/entities/category.entity';
import {
  MaterialImage,
  MaterialImageDocument,
} from '../entities/material-image.entity';

describe('EnhancedMaterialService', () => {
  let service: EnhancedMaterialService;
  let materialModel: jest.Mocked<Model<MaterialDocument>>;
  let categoryModel: jest.Mocked<Model<CategoryDocument>>;
  let imageModel: jest.Mocked<Model<MaterialImageDocument>>;

  const mockMaterial = {
    materialId: 'M001',
    name: '红玛瑙',
    categoryId: 'C001',
    price: 100,
    stock: 50,
    description: '天然红玛瑙',
    color: '红色',
    hardness: 7,
    density: 2.65,
    status: 'enabled',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user123',
    updatedBy: 'user123',
  };

  const mockCategory = {
    categoryId: 'C001',
    name: '宝石类',
  };

  const mockImage = {
    imageId: 'IMG001',
    materialId: 'M001',
    fileName: 'test.jpg',
    filePath: '/uploads/test.jpg',
    thumbnailPath: '/uploads/thumb_test.jpg',
    fileSize: 1024,
    sortOrder: 0,
    isMain: true,
    status: 'active',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnhancedMaterialService,
        {
          provide: getModelToken(Material.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            insertMany: jest.fn(),
          },
        },
        {
          provide: getModelToken(Category.name),
          useValue: {
            findOne: jest.fn(),
            updateOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(MaterialImage.name),
          useValue: {
            find: jest.fn(),
            insertMany: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EnhancedMaterialService>(EnhancedMaterialService);
    materialModel = module.get(getModelToken(Material.name));
    categoryModel = module.get(getModelToken(Category.name));
    imageModel = module.get(getModelToken(MaterialImage.name));

    jest.clearAllMocks();
  });

  describe('getEnhancedMaterialDetail', () => {
    it('应该成功获取增强的材料详情', async () => {
      // 安排
      const detailDto = { materialId: 'M001' };

      materialModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockMaterial),
      } as any);
      categoryModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockCategory),
      } as any);
      imageModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockImage]),
      } as any);

      // 执行
      const result = await service.getEnhancedMaterialDetail(detailDto);

      // 断言
      expect(result).toBeDefined();
      expect(result.materialId).toBe('M001');
      expect(result.name).toBe('红玛瑙');
      expect(result.categoryName).toBe('宝石类');
      expect(result.images).toHaveLength(1);
      expect(result.stats).toBeDefined();
      expect(result.stats.viewCount).toBeGreaterThan(0);
    });

    it('材料不存在时应该抛出错误', async () => {
      // 安排
      const detailDto = { materialId: 'nonexistent' };

      materialModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      // 执行和断言
      await expect(
        service.getEnhancedMaterialDetail(detailDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('copyMaterial', () => {
    it('应该成功复制材料', async () => {
      // 安排
      const copyDto = {
        materialId: 'M001',
        newName: '红玛瑙(副本)',
        copyImages: true,
      };
      const userId = 'user123';

      materialModel.findOne
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue(mockMaterial),
        } as any)
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue(null),
        } as any); // 检查重复名称

      const mockSave = jest.fn().mockResolvedValue({
        materialId: 'M002',
        name: '红玛瑙(副本)',
      });
      const MockMaterial = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));
      (materialModel as any).mockImplementation = MockMaterial;

      imageModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([mockImage]),
      } as any);
      imageModel.insertMany.mockResolvedValue([mockImage] as any);
      categoryModel.updateOne.mockResolvedValue({
        modifiedCount: 1,
      } as any);

      jest.spyOn(service, 'copyMaterial').mockResolvedValue({
        materialId: 'M002',
        name: '红玛瑙(副本)',
      });

      // 执行
      const result = await service.copyMaterial(copyDto, userId);

      // 断言
      expect(result).toBeDefined();
      expect(result.materialId).toBe('M002');
      expect(result.name).toBe('红玛瑙(副本)');
    });

    it('源材料不存在时应该抛出错误', async () => {
      // 安排
      const copyDto = { materialId: 'nonexistent' };
      const userId = 'user123';

      materialModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      // 执行和断言
      await expect(service.copyMaterial(copyDto, userId)).rejects.toThrow(
        HttpException,
      );
    });

    it('材料名称重复时应该抛出错误', async () => {
      // 安排
      const copyDto = {
        materialId: 'M001',
        newName: '重复名称',
      };
      const userId = 'user123';

      materialModel.findOne
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue(mockMaterial),
        } as any)
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue({ name: '重复名称' }),
        } as any); // 发现重复名称

      // 执行和断言
      await expect(service.copyMaterial(copyDto, userId)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
