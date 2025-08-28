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

describe('RoleService', () => {
  let service: RoleService;
  let mockRoleModel: any;
  let mockPermissionService: any;

  const mockPermission = {
    _id: '507f1f77bcf86cd799439012',
    name: 'user:read',
    description: '查看用户',
    category: 'user',
  };

  const mockRole = {
    _id: '507f1f77bcf86cd799439011',
    name: 'admin',
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
    it('should create a role successfully', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'test_role',
        description: '测试角色',
        permissions: ['user:read'],
      };

      mockRoleModel.findOne.mockResolvedValue(null);
      mockPermissionService.findByNames.mockResolvedValue([mockPermission]);

      await service.create(createRoleDto);

      expect(mockRoleModel.findOne).toHaveBeenCalledWith({ name: 'test_role' });
      expect(mockPermissionService.findByNames).toHaveBeenCalledWith([
        'user:read',
      ]);
      expect(mockRoleModel).toHaveBeenCalledWith(createRoleDto);
    });

    it('should throw ConflictException if role name already exists', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'admin',
        description: '管理员角色',
        permissions: ['user:read'],
      };

      mockRoleModel.findOne.mockResolvedValue(mockRole);

      await expect(service.create(createRoleDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if some permissions do not exist', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'test_role',
        description: '测试角色',
        permissions: ['user:read', 'user:write'],
      };

      mockRoleModel.findOne.mockResolvedValue(null);
      mockPermissionService.findByNames.mockResolvedValue([mockPermission]); // 只返回一个权限

      await expect(service.create(createRoleDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const mockRoles = [mockRole];
      mockRoleModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRoles),
      });

      const result = await service.findAll();

      expect(result).toEqual(mockRoles);
      expect(mockRoleModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
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

    it('should throw NotFoundException if role not found', async () => {
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
    it('should update a role successfully', async () => {
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

    it('should throw NotFoundException if role not found', async () => {
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
    it('should remove a role successfully', async () => {
      mockRoleModel.findById.mockResolvedValue(mockRole);
      mockRoleModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRole),
      });

      await service.remove('507f1f77bcf86cd799439011');

      expect(mockRoleModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw NotFoundException if role not found', async () => {
      mockRoleModel.findById.mockResolvedValue(null);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when trying to delete system role', async () => {
      const systemRole = { ...mockRole, isSystem: true };
      mockRoleModel.findById.mockResolvedValue(systemRole);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('addPermissions', () => {
    it('should add permissions to role successfully', async () => {
      const roleWithPermissions = {
        ...mockRole,
        permissions: [mockPermission._id],
      };
      mockPermissionService.findByNames.mockResolvedValue([mockPermission]);
      mockRoleModel.findById.mockResolvedValue(roleWithPermissions);
      mockRoleModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(roleWithPermissions),
      });

      const result = await service.addPermissions('507f1f77bcf86cd799439011', [
        'user:read',
      ]);

      expect(result).toEqual(roleWithPermissions);
    });
  });

  describe('removePermissions', () => {
    it('should remove permissions from role successfully', async () => {
      const roleWithPermissions = {
        ...mockRole,
        permissions: [mockPermission._id],
      };

      mockRoleModel.findById.mockResolvedValue(roleWithPermissions);
      mockRoleModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest
          .fn()
          .mockResolvedValue({ ...roleWithPermissions, permissions: [] }),
      });

      const result = await service.removePermissions(
        '507f1f77bcf86cd799439011',
        [mockPermission._id],
      );

      expect(result.permissions).toEqual([]);
    });
  });
});
