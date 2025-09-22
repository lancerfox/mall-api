import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { MaterialController } from '../controllers/material.controller';
import { MaterialService } from '../services/material.service';
import { ERROR_CODES } from '../../../common/constants/error-codes';

describe('MaterialController', () => {
  let controller: MaterialController;
  let materialService: jest.Mocked<MaterialService>;

  // 测试数据
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
  };

  const mockMaterialListResponse = {
    list: [
      {
        materialId: 'M1234567890ABC',
        name: '测试材料1',
        categoryId: 'C1234567890ABC',
        categoryName: '测试分类',
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
        categoryName: '测试分类',
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
    ],
    total: 2,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialController],
      providers: [
        {
          provide: MaterialService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            batchDelete: jest.fn(),
            toggleStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MaterialController>(MaterialController);
    materialService = module.get(MaterialService);

    // 重置所有 mock
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('应该返回材料列表和分页信息', async () => {
      // 安排
      const query = {
        page: 1,
        pageSize: 10,
        keyword: '',
        categoryId: '',
        status: '',
      };

      materialService.findAll.mockResolvedValue(mockMaterialListResponse);

      // 执行
      const result = await controller.list(query);

      // 断言
      expect(materialService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockMaterialListResponse);
      expect(result.list).toHaveLength(2);
      expect(result.total).toBe(2);
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

      const filteredResponse = {
        ...mockMaterialListResponse,
        list: [mockMaterialListResponse.list[0]],
        total: 1,
      };

      materialService.findAll.mockResolvedValue(filteredResponse);

      // 执行
      const result = await controller.list(query);

      // 断言
      expect(materialService.findAll).toHaveBeenCalledWith(query);
      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('detail', () => {
    it('应该返回指定材料的详细信息', async () => {
      // 安排
      const query = { materialId: 'M1234567890ABC' };
      materialService.findOne.mockResolvedValue(mockMaterial as any);

      // 执行
      const result = await controller.detail(query);

      // 断言
      expect(materialService.findOne).toHaveBeenCalledWith(query.materialId);
      expect(result).toEqual(mockMaterial);
    });

    it('材料不存在时应该传递服务层的错误', async () => {
      // 安排
      const query = { materialId: 'nonexistent-id' };
      const expectedError = new HttpException(
        '材料不存在',
        ERROR_CODES.MATERIAL_NOT_FOUND,
      );
      materialService.findOne.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.detail(query)).rejects.toThrow(expectedError);
    });
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
        status: 'enabled',
      };
      const userId = 'user123';

      materialService.create.mockResolvedValue(mockMaterial as any);

      // 执行
      const result = await controller.create(createMaterialDto, userId);

      // 断言
      expect(materialService.create).toHaveBeenCalledWith(
        createMaterialDto,
        userId,
      );
      expect(result).toEqual({ materialId: mockMaterial.materialId });
    });

    it('分类不存在应该传递服务层的错误', async () => {
      // 安排
      const createMaterialDto = {
        name: '新材料',
        categoryId: 'nonexistent-category',
        price: 150,
        stock: 40,
        status: 'enabled',
      };
      const userId = 'user123';

      const expectedError = new HttpException(
        '分类不存在',
        ERROR_CODES.CATEGORY_NOT_FOUND,
      );
      materialService.create.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(
        controller.create(createMaterialDto, userId),
      ).rejects.toThrow(expectedError);
    });

    it('材料名称重复应该传递服务层的错误', async () => {
      // 安排
      const createMaterialDto = {
        name: '重复材料',
        categoryId: 'C1234567890ABC',
        price: 150,
        stock: 40,
        status: 'enabled',
      };
      const userId = 'user123';

      const expectedError = new HttpException(
        '材料名称已存在',
        ERROR_CODES.MATERIAL_ALREADY_EXISTS,
      );
      materialService.create.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(
        controller.create(createMaterialDto, userId),
      ).rejects.toThrow(expectedError);
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

      const updatedMaterial = { ...mockMaterial, ...updateMaterialDto };
      materialService.update.mockResolvedValue(updatedMaterial as any);

      // 执行
      const result = await controller.update(updateMaterialDto, userId);

      // 断言
      expect(materialService.update).toHaveBeenCalledWith(
        updateMaterialDto,
        userId,
      );
      expect(result).toBeNull();
    });

    it('更新不存在的材料应该传递服务层的错误', async () => {
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

      const expectedError = new HttpException(
        '材料不存在',
        ERROR_CODES.MATERIAL_NOT_FOUND,
      );
      materialService.update.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(
        controller.update(updateMaterialDto, userId),
      ).rejects.toThrow(expectedError);
    });
  });

  describe('delete', () => {
    it('应该成功删除材料', async () => {
      // 安排
      const deleteMaterialDto = { materialId: 'M1234567890ABC' };
      materialService.remove.mockResolvedValue(undefined);

      // 执行
      const result = await controller.delete(deleteMaterialDto);

      // 断言
      expect(materialService.remove).toHaveBeenCalledWith(
        deleteMaterialDto.materialId,
      );
      expect(result).toBeNull();
    });

    it('删除不存在的材料应该传递服务层的错误', async () => {
      // 安排
      const deleteMaterialDto = { materialId: 'nonexistent-id' };
      const expectedError = new HttpException(
        '材料不存在',
        ERROR_CODES.MATERIAL_NOT_FOUND,
      );
      materialService.remove.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.delete(deleteMaterialDto)).rejects.toThrow(
        expectedError,
      );
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

      const updatedMaterial = { ...mockMaterial, status: 'disabled' };
      materialService.toggleStatus.mockResolvedValue(updatedMaterial as any);

      // 执行
      const result = await controller.toggleStatus(toggleStatusDto, userId);

      // 断言
      expect(materialService.toggleStatus).toHaveBeenCalledWith(
        toggleStatusDto,
        userId,
      );
      expect(result).toBeNull();
    });

    it('切换不存在材料的状态应该传递服务层的错误', async () => {
      // 安排
      const toggleStatusDto = {
        materialId: 'nonexistent-id',
        status: 'disabled',
      };
      const userId = 'user123';

      const expectedError = new HttpException(
        '材料不存在',
        ERROR_CODES.MATERIAL_NOT_FOUND,
      );
      materialService.toggleStatus.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(
        controller.toggleStatus(toggleStatusDto, userId),
      ).rejects.toThrow(expectedError);
    });
  });
});
