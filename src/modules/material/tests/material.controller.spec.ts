import { Test, TestingModule } from '@nestjs/testing';
import { MaterialController } from '../controllers/material.controller';
import { MaterialService } from '../services/material.service';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { MaterialListDto } from '../dto/material-list.dto';
import { BatchDeleteMaterialDto } from '../dto/batch-delete-material.dto';
import { ToggleStatusDto } from '../dto/toggle-status.dto';

describe('MaterialController', () => {
  let controller: MaterialController;
  let service: MaterialService;

  const mockMaterial = {
    materialId: 'M001',
    name: '红玛瑙',
    categoryId: 'C001',
    categoryName: '宝石类',
    price: 15.5,
    stock: 100,
    description: '天然红玛瑙',
    color: '红色',
    hardness: 7,
    density: 2.65,
    status: 'enabled',
    createdBy: 'user1',
    updatedBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMaterialService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    batchDelete: jest.fn(),
    toggleStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialController],
      providers: [
        {
          provide: MaterialService,
          useValue: mockMaterialService,
        },
      ],
    }).compile();

    controller = module.get<MaterialController>(MaterialController);
    service = module.get<MaterialService>(MaterialService);
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

    it('should create a material', async () => {
      mockMaterialService.create.mockResolvedValue(mockMaterial);

      const result = await controller.create(createMaterialDto, 'user1');

      expect(service.create).toHaveBeenCalledWith(createMaterialDto, 'user1');
      expect(result).toEqual({
        materialId: mockMaterial.materialId,
      });
    });
  });

  describe('list', () => {
    const query: MaterialListDto = {
      page: 1,
      pageSize: 20,
      keyword: '',
      categoryId: '',
      status: '',
    };

    it('should return materials list', async () => {
      const mockResult = {
        list: [mockMaterial],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };
      mockMaterialService.findAll.mockResolvedValue(mockResult);

      const result = await controller.list(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('detail', () => {
    it('should return a material', async () => {
      const query = { materialId: 'M001' };
      mockMaterialService.findOne.mockResolvedValue(mockMaterial);

      const result = await controller.detail(query);

      expect(service.findOne).toHaveBeenCalledWith('M001');
      expect(result).toEqual(mockMaterial);
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

    it('should update a material', async () => {
      mockMaterialService.update.mockResolvedValue(undefined);

      const result = await controller.update(updateMaterialDto, 'user1');

      expect(service.update).toHaveBeenCalledWith(updateMaterialDto, 'user1');
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should remove a material', async () => {
      const deleteDto = { materialId: 'M001' };
      mockMaterialService.remove.mockResolvedValue(undefined);

      const result = await controller.delete(deleteDto);

      expect(service.remove).toHaveBeenCalledWith('M001');
      expect(result).toBeNull();
    });
  });

  describe('batchDelete', () => {
    const batchDeleteDto: BatchDeleteMaterialDto = {
      materialIds: ['M001', 'M002', 'M003'],
    };

    it('should batch delete materials', async () => {
      const mockResult = {
        successCount: 3,
        failedCount: 0,
        failedIds: [],
      };
      mockMaterialService.batchDelete.mockResolvedValue(mockResult);

      const result = await controller.batchDelete(batchDeleteDto);

      expect(service.batchDelete).toHaveBeenCalledWith(batchDeleteDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('toggleStatus', () => {
    const toggleStatusDto: ToggleStatusDto = {
      materialId: 'M001',
      status: 'disabled',
    };

    it('should toggle material status', async () => {
      mockMaterialService.toggleStatus.mockResolvedValue(undefined);

      const result = await controller.toggleStatus(toggleStatusDto, 'user1');

      expect(service.toggleStatus).toHaveBeenCalledWith(
        toggleStatusDto,
        'user1',
      );
      expect(result).toBeNull();
    });
  });
});
