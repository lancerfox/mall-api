import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PermissionService } from '../services/permission.service';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionType } from '../../../common/decorators/roles.decorator';

describe('PermissionService', () => {
  let service: PermissionService;
  let permissionModel: any;

  const mockPermission = {
    _id: '507f1f77bcf86cd799439011',
    name: 'user:read',
    description: '读取用户信息权限',
    type: PermissionType.API,
    module: 'user',
    status: 'active',
    save: jest.fn(),
  };

  // Mock构造函数函数
  const mockPermissionModel = jest.fn().mockImplementation((data) => ({
    ...mockPermission,
    ...data,
    save: jest.fn().mockResolvedValue({ ...mockPermission, ...data }),
  }));

  // 添加模型方法
  Object.assign(mockPermissionModel, {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getModelToken(Permission.name),
          useValue: mockPermissionModel,
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    permissionModel = module.get(getModelToken(Permission.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create - 创建权限', () => {
    it('应该成功创建权限', async () => {
      const createDto: CreatePermissionDto = {
        name: 'user:read',
        description: '读取用户信息权限',
        type: PermissionType.API,
        module: 'user',
      };

      const mockPermissionInstance = {
        save: jest.fn().mockResolvedValue({
          _id: '123',
          ...createDto,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      permissionModel.findOne.mockResolvedValue(null);
      (permissionModel as unknown as jest.Mock).mockReturnValue(
        mockPermissionInstance,
      );

      const result = await service.create(createDto);

      expect(permissionModel.findOne).toHaveBeenCalledWith({
        name: createDto.name,
      });
      expect(permissionModel).toHaveBeenCalledWith(createDto);
      expect(mockPermissionInstance.save).toHaveBeenCalled();
    });

    it('当权限名称已存在时应抛出ConflictException', async () => {
      const createDto: CreatePermissionDto = {
        name: 'user:read',
        description: '读取用户信息权限',
        type: PermissionType.API,
      };

      permissionModel.findOne.mockResolvedValue(mockPermission);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(permissionModel.findOne).toHaveBeenCalledWith({
        name: createDto.name,
      });
    });
  });

  describe('findAll - 获取所有权限', () => {
    it('应该返回所有权限', async () => {
      const permissions = [mockPermission, { ...mockPermission, _id: '2' }];
      permissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(permissions),
      });

      const result = await service.findAll();

      expect(permissionModel.find).toHaveBeenCalled();
      expect(result).toEqual(permissions);
    });
  });

  describe('findOne - 根据ID查找权限', () => {
    it('应该通过ID返回权限', async () => {
      permissionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPermission),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(permissionModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockPermission);
    });

    it('当权限未找到时应抛出NotFoundException', async () => {
      permissionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById - 根据ID查找权限', () => {
    it('应该通过ID返回权限', async () => {
      permissionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPermission),
      });

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(permissionModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockPermission);
    });
  });

  describe('findByName - 根据名称查找权限', () => {
    it('应该通过名称返回权限', async () => {
      permissionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPermission),
      });

      const result = await service.findByName('user:read');

      expect(permissionModel.findOne).toHaveBeenCalledWith({
        name: 'user:read',
      });
      expect(result).toEqual(mockPermission);
    });

    it('当通过名称未找到权限时应返回null', async () => {
      permissionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findByName('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByNames - 根据名称列表查找权限', () => {
    it('应该通过名称列表返回权限', async () => {
      const permissions = [mockPermission];
      permissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(permissions),
      });

      const result = await service.findByNames(['user:read']);

      expect(permissionModel.find).toHaveBeenCalledWith({
        name: { $in: ['user:read'] },
      });
      expect(result).toEqual(permissions);
    });
  });

  describe('findByIds - 根据ID列表查找权限', () => {
    it('应该通过ID列表返回权限', async () => {
      const permissions = [mockPermission];
      permissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(permissions),
      });

      const result = await service.findByIds(['507f1f77bcf86cd799439011']);

      expect(permissionModel.find).toHaveBeenCalledWith({
        _id: { $in: ['507f1f77bcf86cd799439011'] },
      });
      expect(result).toEqual(permissions);
    });
  });

  describe('update - 更新权限', () => {
    it('应该成功更新权限', async () => {
      const updateDto: UpdatePermissionDto = {
        description: '更新后的描述',
      };

      permissionModel.findOne.mockResolvedValue(null);
      permissionModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockPermission, ...updateDto }),
      });

      const result = await service.update(
        '507f1f77bcf86cd799439011',
        updateDto,
      );

      expect(permissionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
        { new: true },
      );
      expect(result.description).toBe('更新后的描述');
    });

    it('当权限名称已存在时应抛出ConflictException', async () => {
      const updateDto: UpdatePermissionDto = {
        name: 'existing:permission',
      };

      permissionModel.findOne.mockResolvedValue(mockPermission);

      await expect(
        service.update('507f1f77bcf86cd799439011', updateDto),
      ).rejects.toThrow(ConflictException);
    });

    it('当权限未找到时应抛出NotFoundException', async () => {
      const updateDto: UpdatePermissionDto = {
        description: '更新描述',
      };

      permissionModel.findOne.mockResolvedValue(null);
      permissionModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('nonexistent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove - 删除权限', () => {
    it('应该成功删除权限', async () => {
      permissionModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPermission),
      });

      await service.remove('507f1f77bcf86cd799439011');

      expect(permissionModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('当权限未找到时应抛出NotFoundException', async () => {
      permissionModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByModule - 根据模块查找权限', () => {
    it('应该通过模块返回权限', async () => {
      const permissions = [mockPermission];
      permissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(permissions),
      });

      const result = await service.findByModule('user');

      expect(permissionModel.find).toHaveBeenCalledWith({ module: 'user' });
      expect(result).toEqual(permissions);
    });
  });

  describe('findByType - 根据类型查找权限', () => {
    it('应该通过类型返回权限', async () => {
      const permissions = [mockPermission];
      permissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(permissions),
      });

      const result = await service.findByType(PermissionType.API);

      expect(permissionModel.find).toHaveBeenCalledWith({
        type: PermissionType.API,
      });
      expect(result).toEqual(permissions);
    });
  });

  describe('findByModuleAndType - 根据模块和类型查找权限', () => {
    it('应该通过模块和类型返回权限', async () => {
      const permissions = [mockPermission];
      permissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(permissions),
      });

      const result = await service.findByModuleAndType(
        'user',
        PermissionType.API,
      );

      expect(permissionModel.find).toHaveBeenCalledWith({
        module: 'user',
        type: PermissionType.API,
      });
      expect(result).toEqual(permissions);
    });
  });
});
