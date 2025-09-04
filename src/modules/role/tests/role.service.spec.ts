import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { PermissionService } from '../../permission/services/permission.service';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RoleType } from '../../../common/enums/role-type.enum';

describe('RoleService', () => {
  let service: RoleService;
  let mockRoleModel: any;
  let mockPermissionService: any;

  const mockPermission = {
    _id: '507f1f77bcf86cd799439012',
    name: 'user:read',
    description: '查看用户',
    category: 'user',
    type: 'read',
  };

  const mockRole = {
    _id: '507f1f77bcf86cd799439011',
    name: 'admin',
    type: RoleType.ADMIN,
    description: '管理员角色',
    permissions: ['507f1f77bcf86cd799439012'],
    isSystem: false,
    status: 'active',
    save: jest.fn().mockReturnThis(),
    toObject: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const mockSave = jest.fn().mockResolvedValue(mockRole);
    mockRoleModel = jest.fn().mockImplementation(() => ({
      save: mockSave,
    }));

    mockRoleModel.findOne = jest.fn();
    mockRoleModel.find = jest.fn();
    mockRoleModel.findById = jest.fn();
    mockRoleModel.findByIdAndUpdate = jest.fn();
    mockRoleModel.findByIdAndDelete = jest.fn();

    mockPermissionService = {
      findByNames: jest.fn(),
      findByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getModelToken(Role.name),
          useValue: mockRoleModel,
        },
        {
          provide: PermissionService,
          useValue: mockPermissionService,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建角色', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'test_role',
        type: 'admin',
        description: '测试角色',
        permissions: ['user:read'],
      };

      mockRoleModel.findOne.mockResolvedValue(null);
      mockPermissionService.findByIds.mockResolvedValue([mockPermission]);

      await service.create(createRoleDto);

      expect(mockRoleModel.findOne).toHaveBeenCalledWith({ name: 'test_role' });
      expect(mockPermissionService.findByIds).toHaveBeenCalledWith([
        'user:read',
      ]);
      expect(mockRoleModel).toHaveBeenCalledWith(createRoleDto);
    });

    it('当角色名称已存在时应抛出ConflictException', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'admin',
        type: 'admin',
        description: '管理员角色',
        permissions: ['user:read'],
      };

      mockRoleModel.findOne.mockResolvedValue(mockRole);

      await expect(service.create(createRoleDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('当某些权限不存在时应抛出BadRequestException', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'test_role',
        type: 'admin',
        description: '测试角色',
        permissions: ['user:read', 'user:write'],
      };

      mockRoleModel.findOne.mockResolvedValue(null);
      mockPermissionService.findByIds.mockResolvedValue([mockPermission]); // 只返回一个权限

      await expect(service.create(createRoleDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('应该返回所有角色', async () => {
      const mockRoles = [mockRole];
      mockRoleModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRoles),
      });

      const result = await service.findAll();

      expect(result).toEqual(mockRoles);
      expect(mockRoleModel.find).toHaveBeenCalled();
      expect(mockRoleModel.find().select).toHaveBeenCalledWith('-permissions');
    });
  });

  describe('findOne', () => {
    it('应该通过ID返回角色', async () => {
      mockRoleModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRole),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockRole);
      expect(mockRoleModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('当角色未找到时应抛出NotFoundException', async () => {
      mockRoleModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('应该成功更新角色', async () => {
      const updateRoleDto: UpdateRoleDto = {
        description: '更新后的描述',
      };

      const updatedRole = { ...mockRole, ...updateRoleDto };
      mockRoleModel.findById.mockResolvedValue(mockRole);
      mockRoleModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedRole),
      });

      const result = await service.update(
        '507f1f77bcf86cd799439011',
        updateRoleDto,
      );

      expect(result).toEqual(updatedRole);
    });

    it('当尝试更新角色类型时应抛出BadRequestException', async () => {
      const updateRoleDto: UpdateRoleDto = {
        type: RoleType.OPERATOR,
      };

      mockRoleModel.findById.mockResolvedValue(mockRole);

      await expect(
        service.update('507f1f77bcf86cd799439011', updateRoleDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('当角色未找到时应抛出NotFoundException', async () => {
      const updateRoleDto: UpdateRoleDto = {
        description: '更新后的描述',
      };

      mockRoleModel.findById.mockResolvedValue(null);

      await expect(
        service.update('507f1f77bcf86cd799439011', updateRoleDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('应该成功删除角色', async () => {
      mockRoleModel.findById.mockResolvedValue(mockRole);
      mockRoleModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRole),
      });

      await service.remove('507f1f77bcf86cd799439011');

      expect(mockRoleModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('当角色未找到时应抛出NotFoundException', async () => {
      mockRoleModel.findById.mockResolvedValue(null);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('当尝试删除系统角色时应抛出BadRequestException', async () => {
      const systemRole = { ...mockRole, isSystem: true };
      mockRoleModel.findById.mockResolvedValue(systemRole);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updatePermissions', () => {
    it('应该成功更新角色权限', async () => {
      const roleWithPermissions = {
        ...mockRole,
        permissions: [mockPermission._id],
      };
      mockPermissionService.findByIds.mockResolvedValue([mockPermission]);
      mockRoleModel.findById.mockResolvedValue(roleWithPermissions);
      mockRoleModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(roleWithPermissions),
      });

      const result = await service.updatePermissions(
        '507f1f77bcf86cd799439011',
        ['user:read'],
      );

      expect(result).toEqual(roleWithPermissions);
      expect(mockRoleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { permissions: ['user:read'] },
        { new: true },
      );
    });

    it('当角色未找到时应抛出NotFoundException', async () => {
      mockRoleModel.findById.mockResolvedValue(null);

      await expect(
        service.updatePermissions('507f1f77bcf86cd799439011', ['user:read']),
      ).rejects.toThrow(NotFoundException);
    });

    it('当某些权限不存在时应抛出BadRequestException', async () => {
      const roleWithPermissions = {
        ...mockRole,
        permissions: [mockPermission._id],
      };
      mockRoleModel.findById.mockResolvedValue(roleWithPermissions);
      mockPermissionService.findByIds.mockResolvedValue([]); // 没有找到权限

      await expect(
        service.updatePermissions('507f1f77bcf86cd799439011', ['user:read']),
      ).rejects.toThrow(BadRequestException);
    });

    it('当提供空数组时应清除所有权限', async () => {
      const roleWithPermissions = {
        ...mockRole,
        permissions: [mockPermission._id],
      };
      const updatedRole = { ...roleWithPermissions, permissions: [] };
      mockRoleModel.findById.mockResolvedValue(roleWithPermissions);
      mockRoleModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedRole),
      });

      const result = await service.updatePermissions(
        '507f1f77bcf86cd799439011',
        [],
      );

      expect(result.permissions).toEqual([]);
      expect(mockRoleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { permissions: [] },
        { new: true },
      );
    });
  });

  describe('findByName', () => {
    it('应该通过名称返回角色', async () => {
      mockRoleModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRole),
      });

      const result = await service.findByName('admin');

      expect(result).toEqual(mockRole);
      expect(mockRoleModel.findOne).toHaveBeenCalledWith({ name: 'admin' });
    });

    it('当通过名称未找到角色时应返回null', async () => {
      mockRoleModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findByName('nonexistent');

      expect(result).toBeNull();
      expect(mockRoleModel.findOne).toHaveBeenCalledWith({ name: 'nonexistent' });
    });
  });

  describe('findByType', () => {
    it('应该通过类型返回角色', async () => {
      mockRoleModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRole),
      });

      const result = await service.findByType(RoleType.ADMIN);

      expect(result).toEqual(mockRole);
      expect(mockRoleModel.findOne).toHaveBeenCalledWith({ type: RoleType.ADMIN });
    });

    it('当通过类型未找到角色时应返回null', async () => {
      mockRoleModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findByType(RoleType.OPERATOR);

      expect(result).toBeNull();
      expect(mockRoleModel.findOne).toHaveBeenCalledWith({ type: RoleType.OPERATOR });
    });
  });

  describe('findByIds', () => {
    it('应该通过ID列表返回角色', async () => {
      const mockRoles = [mockRole];
      mockRoleModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRoles),
      });

      const result = await service.findByIds(['507f1f77bcf86cd799439011']);

      expect(result).toEqual(mockRoles);
      expect(mockRoleModel.find).toHaveBeenCalledWith({
        _id: { $in: ['507f1f77bcf86cd799439011'] }
      });
    });

    it('当未找到角色时应返回空数组', async () => {
      mockRoleModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findByIds(['nonexistent']);

      expect(result).toEqual([]);
    });
  });

  describe('addPermissions', () => {
    it('应该成功添加权限到角色', async () => {
      const roleWithPermissions = {
        ...mockRole,
        permissions: ['existing_permission'],
      };
      const updatedRole = {
        ...mockRole,
        permissions: ['existing_permission', '507f1f77bcf86cd799439012'],
      };

      mockRoleModel.findById.mockResolvedValue(roleWithPermissions);
      mockPermissionService.findByIds.mockResolvedValue([mockPermission]);
      mockRoleModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedRole),
      });

      const result = await service.addPermissions(
        '507f1f77bcf86cd799439011',
        ['507f1f77bcf86cd799439012']
      );

      expect(result).toEqual(updatedRole);
      expect(mockPermissionService.findByIds).toHaveBeenCalledWith(['507f1f77bcf86cd799439012']);
    });

    it('当角色未找到时应抛出NotFoundException', async () => {
      mockRoleModel.findById.mockResolvedValue(null);

      await expect(
        service.addPermissions('507f1f77bcf86cd799439011', ['user:read'])
      ).rejects.toThrow(NotFoundException);
    });

    it('当某些权限不存在时应抛出BadRequestException', async () => {
      mockRoleModel.findById.mockResolvedValue(mockRole);
      mockPermissionService.findByIds.mockResolvedValue([]);

      await expect(
        service.addPermissions('507f1f77bcf86cd799439011', ['nonexistent'])
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getRoleTypes', () => {
    it('应该返回所有带标签的角色类型', async () => {
      const result = await service.getRoleTypes();

      expect(result).toEqual([
        { value: 'super_admin', label: '超级管理员' },
        { value: 'admin', label: '管理员' },
        { value: 'operator', label: '操作员' }
      ]);
    });
  });

  describe('findPermissionsByRoleId', () => {
    it('应该返回角色的权限', async () => {
      const roleWithPermissions = {
        ...mockRole,
        permissions: [mockPermission],
      };

      mockRoleModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(roleWithPermissions),
      });

      const result = await service.findPermissionsByRoleId(
        '507f1f77bcf86cd799439011',
      );

      expect(result).toEqual([
        {
          id: mockPermission._id,
          name: mockPermission.name,
          description: mockPermission.description,
          code: mockPermission.name, // 使用name作为code
          type: mockPermission.type,
        },
      ]);
      expect(mockRoleModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw NotFoundException if role not found', async () => {
      mockRoleModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.findPermissionsByRoleId('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(NotFoundException);
    });

    it('当角色没有权限时应返回空数组', async () => {
      const roleWithoutPermissions = {
        ...mockRole,
        permissions: [],
      };

      mockRoleModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(roleWithoutPermissions),
      });

      const result = await service.findPermissionsByRoleId(
        '507f1f77bcf86cd799439011',
      );

      expect(result).toEqual([]);
    });
  });
});
