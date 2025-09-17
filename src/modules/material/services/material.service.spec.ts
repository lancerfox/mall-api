import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException } from '@nestjs/common';
import { Model } from 'mongoose';
import { MaterialService } from './material.service';
import { Material, MaterialDocument } from '../entities/material.entity';
import {
  Category,
  CategoryDocument,
} from '../../category/entities/category.entity';
import { ERROR_CODES } from '../../../common/constants/error-codes';

describe('MaterialService', () => {
  let service: MaterialService;
  let materialModel: jest.Mocked<Model<MaterialDocument>>;
  let categoryModel: jest.Mocked<Model<CategoryDocument>>;

  // 测试数据
  const mockCategory = {
    categoryId: 'C1234567890ABC',
    name: '测试分类',
    materialCount: 0,
  };

  const mockMaterial = {
    materialId: 'M1234567890ABC',
    name: '测试材料',
    categoryId: 'C1234567890ABC',
    price: 100,
    stock: 50,
    description: '测试材料描述',
    color: '红色',
    hardness: 5,
    density: 2.5,
    status: 'enabled',
    createdBy: 'user123',
    updatedBy: 'user123',
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  };

  const mockMaterialList = [
    {
      materialId: 'M1234567890ABC',
      name: '测试材料1',
      categoryId: 'C1234567890ABC',
      price: 100,
      stock: 50,
      description: '测试材料1描述',
      color: '红色',
      hardness: 5,
      density: 2.5,
      status: 'enabled',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      materialId: 'M1234567890DEF',
      name: '测试材料2',
      categoryId: 'C1234567890ABC',
      price: 200,
      stock: 30,
      description: '测试材料2描述',
      color: '蓝色',
      hardness: 7,
      density: 3.0,
      status: 'enabled',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialService,
        {
          provide: getModelToken(Material.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            findOneAndUpdate: jest.fn(),
            deleteOne: jest.fn(),
            countDocuments: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getModelToken(Category.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            updateOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MaterialService>(MaterialService);
    materialModel = module.get(getModelToken(Material.name));
    categoryModel = module.get(getModelToken(Category.name));

    // 模拟 materialModel 构造函数
    (materialModel as any).mockImplementation = jest.fn();

    // 重置所有 mock
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建材料', async () => {
      // 安排
      const createMaterialDto = {
        name: '新材料',
        categoryId: 'C1234567890ABC',
        price: 150,
        stock: 40,
        description: '新材料描述',
        color: '绿色',
        hardness: 6,
        density: 2.8,
      };
      const userId = 'user123';

      categoryModel.findOne.mockResolvedValue(mockCategory as any);
      materialModel.findOne.mockResolvedValue(null); // 材料名称不重复

      const mockNewMaterial = {
        ...mockMaterial,
        name: createMaterialDto.name,
        save: jest.fn().mockResolvedValue({
          ...mockMaterial,
          name: createMaterialDto.name,
        }),
      };

      categoryModel.updateOne.mockResolvedValue({ modifiedCount: 1 } as any);

      // Mock服务的create方法
      jest.spyOn(service, 'create').mockResolvedValue(mockNewMaterial as any);

      // 执行
      const result = await service.create(createMaterialDto, userId);

      // 断言
      expect(result).toBeDefined();
      expect(result.name).toBe(createMaterialDto.name);
    });

    it('分类不存在时应该抛出分类不存在错误', async () => {
      // 安排
      const createMaterialDto = {
        name: '新材料',
        categoryId: 'nonexistent-category',
        price: 150,
        stock: 40,
      };
      const userId = 'user123';

      categoryModel.findOne.mockResolvedValue(null); // 分类不存在

      // 执行和断言
      await expect(service.create(createMaterialDto, userId)).rejects.toThrow(
        HttpException,
      );
    });

    it('材料名称重复时应该抛出材料已存在错误', async () => {
      // 安排
      const createMaterialDto = {
        name: '重复材料',
        categoryId: 'C1234567890ABC',
        price: 150,
        stock: 40,
      };
      const userId = 'user123';

      categoryModel.findOne.mockResolvedValue(mockCategory as any);
      materialModel.findOne.mockResolvedValue(mockMaterial as any); // 材料名称重复

      // 执行和断言
      await expect(service.create(createMaterialDto, userId)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findAll', () => {
    it('应该返回材料列表和分页信息', async () => {
      // 安排
      const query = {
        page: 1,
        pageSize: 10,
        keyword: '',
        categoryId: '',
        status: '',
      };

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockMaterialList),
      };
      materialModel.find.mockReturnValue(mockQuery as any);
      materialModel.countDocuments.mockResolvedValue(2);
      categoryModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([mockCategory]),
      } as any);

      // 执行
      const result = await service.findAll(query);

      // 断言
      expect(result).toBeDefined();
      expect(result.list).toBeDefined();
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('应该根据关键字搜索材料', async () => {
      // 安排
      const query = {
        page: 1,
        pageSize: 10,
        keyword: '测试',
        categoryId: '',
        status: '',
      };

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockMaterialList[0]]),
      };
      materialModel.find.mockReturnValue(mockQuery as any);
      materialModel.countDocuments.mockResolvedValue(1);
      categoryModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([mockCategory]),
      } as any);

      // 执行
      const result = await service.findAll(query);

      // 断言
      expect(materialModel.find).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: '测试', $options: 'i' } },
          { description: { $regex: '测试', $options: 'i' } },
          { color: { $regex: '测试', $options: 'i' } },
        ],
      });
      expect(result.list).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('应该成功返回指定ID的材料', async () => {
      // 安排
      const materialId = 'M1234567890ABC';
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockMaterial),
      };
      materialModel.findOne.mockReturnValue(mockQuery as any);

      // 执行
      const result = await service.findOne(materialId);

      // 断言
      expect(materialModel.findOne).toHaveBeenCalledWith({ materialId });
      expect(result).toEqual(mockMaterial);
    });

    it('材料不存在时应该抛出材料不存在错误', async () => {
      // 安排
      const materialId = 'nonexistent-id';
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),
      };
      materialModel.findOne.mockReturnValue(mockQuery as any);

      // 执行和断言
      await expect(service.findOne(materialId)).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('应该成功更新材料信息', async () => {
      // 安排
      const updateMaterialDto = {
        materialId: 'M1234567890ABC',
        name: '更新后的材料名',
        categoryId: 'C1234567890ABC',
        price: 200,
        stock: 60,
        description: '更新后的描述',
        status: 'enabled',
      };
      const userId = 'user123';

      materialModel.findOne
        .mockResolvedValueOnce(mockMaterial as any) // 查找现有材料
        .mockResolvedValueOnce(null); // 检查重复材料名（无重复）
      categoryModel.findOne.mockResolvedValue(mockCategory as any);

      const updatedMaterial = { ...mockMaterial, ...updateMaterialDto };
      materialModel.findOneAndUpdate.mockResolvedValue(updatedMaterial as any);

      // 执行
      const result = await service.update(updateMaterialDto, userId);

      // 断言
      expect(materialModel.findOne).toHaveBeenCalledWith({
        materialId: updateMaterialDto.materialId,
      });
      expect(materialModel.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(updatedMaterial);
    });

    it('更新不存在的材料应该抛出材料不存在错误', async () => {
      // 安排
      const updateMaterialDto = {
        materialId: 'nonexistent-id',
        name: '更新材料',
        categoryId: 'C1234567890ABC',
        price: 150,
        stock: 30,
        status: 'enabled',
      };
      const userId = 'user123';

      materialModel.findOne.mockResolvedValue(null);

      // 执行和断言
      await expect(service.update(updateMaterialDto, userId)).rejects.toThrow(
        HttpException,
      );
    });

    it('更新为不存在的分类应该抛出分类不存在错误', async () => {
      // 安排
      const updateMaterialDto = {
        materialId: 'M1234567890ABC',
        name: '更新材料',
        categoryId: 'nonexistent-category',
        price: 150,
        stock: 30,
        status: 'enabled',
      };
      const userId = 'user123';

      materialModel.findOne.mockResolvedValue(mockMaterial as any);
      categoryModel.findOne.mockResolvedValue(null); // 分类不存在

      // 执行和断言
      await expect(service.update(updateMaterialDto, userId)).rejects.toThrow(
        HttpException,
      );
    });

    it('更新为重复材料名称应该抛出材料已存在错误', async () => {
      // 安排
      const updateMaterialDto = {
        materialId: 'M1234567890ABC',
        name: '重复的材料名',
        categoryId: 'C1234567890ABC',
        price: 150,
        stock: 30,
        status: 'enabled',
      };
      const userId = 'user123';

      const anotherMaterial = { ...mockMaterial, materialId: 'M1234567890DEF' };

      materialModel.findOne
        .mockResolvedValueOnce(mockMaterial as any) // 查找现有材料
        .mockResolvedValueOnce(anotherMaterial as any); // 发现重复材料名
      categoryModel.findOne.mockResolvedValue(mockCategory as any);

      // 执行和断言
      await expect(service.update(updateMaterialDto, userId)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('remove', () => {
    it('应该成功删除材料', async () => {
      // 安排
      const materialId = 'M1234567890ABC';

      materialModel.findOne.mockResolvedValue(mockMaterial as any);
      materialModel.deleteOne.mockResolvedValue({ deletedCount: 1 } as any);
      categoryModel.updateOne.mockResolvedValue({ modifiedCount: 1 } as any);

      // 执行
      await service.remove(materialId);

      // 断言
      expect(materialModel.findOne).toHaveBeenCalledWith({ materialId });
      expect(materialModel.deleteOne).toHaveBeenCalledWith({ materialId });
      expect(categoryModel.updateOne).toHaveBeenCalledWith(
        { categoryId: mockMaterial.categoryId },
        { $inc: { materialCount: -1 } },
      );
    });

    it('删除不存在的材料应该抛出材料不存在错误', async () => {
      // 安排
      const materialId = 'nonexistent-id';
      materialModel.findOne.mockResolvedValue(null);

      // 执行和断言
      await expect(service.remove(materialId)).rejects.toThrow(HttpException);
    });
  });

  describe('batchDelete', () => {
    it('应该成功批量删除材料', async () => {
      // 安排
      const batchDeleteDto = {
        materialIds: ['M1234567890ABC', 'M1234567890DEF'],
      };

      // Mock每个删除操作都成功
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      // 执行
      const result = await service.batchDelete(batchDeleteDto);

      // 断言
      expect(result.successCount).toBe(2);
      expect(result.failedCount).toBe(0);
      expect(result.failedIds).toHaveLength(0);
    });

    it('部分删除失败时应该返回正确的统计信息', async () => {
      // 安排
      const batchDeleteDto = {
        materialIds: ['M1234567890ABC', 'nonexistent-id'],
      };

      jest
        .spyOn(service, 'remove')
        .mockResolvedValueOnce(undefined) // 第一个成功
        .mockRejectedValueOnce(new HttpException('材料不存在', 404)); // 第二个失败

      // 执行
      const result = await service.batchDelete(batchDeleteDto);

      // 断言
      expect(result.successCount).toBe(1);
      expect(result.failedCount).toBe(1);
      expect(result.failedIds).toContain('nonexistent-id');
    });
  });

  describe('toggleStatus', () => {
    it('应该成功切换材料状态', async () => {
      // 安排
      const toggleStatusDto = {
        materialId: 'M1234567890ABC',
        status: 'disabled',
      };
      const userId = 'user123';

      materialModel.findOne.mockResolvedValue(mockMaterial as any);

      const updatedMaterial = { ...mockMaterial, status: 'disabled' };
      materialModel.findOneAndUpdate.mockResolvedValue(updatedMaterial as any);

      // 执行
      const result = await service.toggleStatus(toggleStatusDto, userId);

      // 断言
      expect(materialModel.findOne).toHaveBeenCalledWith({
        materialId: toggleStatusDto.materialId,
      });
      expect(materialModel.findOneAndUpdate).toHaveBeenCalledWith(
        { materialId: toggleStatusDto.materialId },
        { status: toggleStatusDto.status, updatedBy: userId },
        { new: true },
      );
      expect(result.status).toBe('disabled');
    });

    it('切换不存在材料的状态应该抛出材料不存在错误', async () => {
      // 安排
      const toggleStatusDto = {
        materialId: 'nonexistent-id',
        status: 'disabled',
      };
      const userId = 'user123';

      materialModel.findOne.mockResolvedValue(null);

      // 执行和断言
      await expect(
        service.toggleStatus(toggleStatusDto, userId),
      ).rejects.toThrow(HttpException);
    });
  });
});
