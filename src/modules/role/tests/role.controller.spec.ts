import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { RoleController } from '../controllers/role.controller';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleWithIdDto } from '../dto/update-role-with-id.dto';
import { Role } from '../entities/role.entity';
import { RoleType } from '../../../common/enums/role-type.enum';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';

describe('RoleController', () => {
  let controller: RoleController;
  let roleService: RoleService;

  const mockRoleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
    updatePermissions: jest.fn(),
    update: jest.fn(),
    findPermissionsByRoleId: jest.fn(),
    getRoleTypes: jest.fn(),
  };

  const mockPermission = {
    _id: new Types.ObjectId(),
    name: '权限1',
    description: '权限描述1',
    category: 'user',
    type: 'read',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RoleController>(RoleController);
    roleService = module.get<RoleService>(RoleService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建角色', async () => {
      const createRoleDto: CreateRoleDto = {
        name: '测试角色',
        type: RoleType.ADMIN,
        description: '测试描述',
        permissions: [new Types.ObjectId(), new Types.ObjectId()],
      };

      const mockResult: Role = {
        id: '123',
        name: '测试角色',
        type: RoleType.ADMIN,
        description: '测试描述',
        permissions: [new Types.ObjectId(), new Types.ObjectId()],
        isSystem: false,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRoleService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createRoleDto);

      expect(roleService.create).toHaveBeenCalledWith(createRoleDto);
      expect(result).toEqual(mockResult);
    });

    it('创建角色时应该处理服务层错误', async () => {
      const createRoleDto: CreateRoleDto = {
        name: '测试角色',
        type: RoleType.ADMIN,
        description: '测试描述',
      };

      const error = new Error('创建失败');
      mockRoleService.create.mockRejectedValue(error);

      await expect(controller.create(createRoleDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('应该返回所有角色列表', async () => {
      const mockRoles: Role[] = [
        {
          _id: '1',
          name: '管理员',
          type: RoleType.ADMIN,
          description: '系统管理员',
          permissions: [],
          isSystem: false,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: '操作员',
          type: RoleType.OPERATOR,
          description: '普通操作员',
          permissions: [],
          isSystem: false,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRoleService.findAll.mockResolvedValue(mockRoles);

      const result = await controller.findAll();

      expect(roleService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockRoles);
      expect(result).toHaveLength(2);
    });

    it('应该返回空数组当没有角色时', async () => {
      mockRoleService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('remove', () => {
    it('应该成功删除角色', async () => {
      const roleId = '123';
      mockRoleService.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove(roleId);

      expect(roleService.remove).toHaveBeenCalledWith(roleId);
      expect(result).toEqual({ deleted: true });
    });

    it('应该处理删除不存在的角色', async () => {
      const roleId = 'nonexistent';
      mockRoleService.remove.mockResolvedValue({ deleted: false });

      const result = await controller.remove(roleId);

      expect(result).toEqual({ deleted: false });
    });
  });

  describe('updatePermissions', () => {
    it('应该成功更新角色权限', async () => {
      const roleId = '123';
      const permissionIds = [new Types.ObjectId(), new Types.ObjectId()];
      const updatedRole: Role = {
        id: roleId,
        name: '测试角色',
        type: RoleType.ADMIN,
        description: '测试描述',
        permissions: permissionIds,
        isSystem: false,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRoleService.updatePermissions.mockResolvedValue(updatedRole);

      const result = await controller.updatePermissions(roleId, permissionIds);

      expect(roleService.updatePermissions).toHaveBeenCalledWith(
        roleId,
        permissionIds,
      );
      expect(result).toEqual(updatedRole);
    });
  });

  describe('update', () => {
    it('应该成功更新角色信息', async () => {
      const updateRoleDto: UpdateRoleWithIdDto = {
        id: '123',
        name: '更新后的角色名',
        description: '更新后的描述',
      };

      const updatedRole: Role = {
        id: '123',
        name: '更新后的角色名',
        type: RoleType.ADMIN,
        description: '更新后的描述',
        permissions: [],
        isSystem: false,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRoleService.update.mockResolvedValue(updatedRole);

      const result = await controller.update(updateRoleDto);

      expect(roleService.update).toHaveBeenCalledWith('123', updateRoleDto);
      expect(result).toEqual(updatedRole);
    });
  });

  describe('getPermissions', () => {
    it('应该返回角色的权限列表', async () => {
      const roleId = '123';
      const permissions = [
        {
          _id: new Types.ObjectId(),
          name: '权限1',
          description: '描述1',
          category: 'user',
          type: 'read',
        },
        {
          _id: new Types.ObjectId(),
          name: '权限2',
          description: '描述2',
          category: 'system',
          type: 'write',
        },
      ];

      mockRoleService.findPermissionsByRoleId.mockResolvedValue(permissions);

      const result = await controller.getPermissions(roleId);

      expect(roleService.findPermissionsByRoleId).toHaveBeenCalledWith(
        roleId,
        undefined,
      );
      expect(result).toEqual(permissions);
    });

    it('应该支持按类型筛选权限', async () => {
      const roleId = '123';
      const type = 'read';
      const permissions = [
        {
          _id: new Types.ObjectId(),
          name: '权限1',
          description: '描述1',
          category: 'user',
          type: 'read',
        },
      ];

      mockRoleService.findPermissionsByRoleId.mockResolvedValue(permissions);

      const result = await controller.getPermissions(roleId, type);

      expect(roleService.findPermissionsByRoleId).toHaveBeenCalledWith(
        roleId,
        type,
      );
      expect(result).toEqual(permissions);
    });
  });

  describe('getRoleTypes', () => {
    it('应该返回所有角色类型', async () => {
      const roleTypes = [
        { value: 'super_admin', label: '超级管理员' },
        { value: 'admin', label: '管理员' },
        { value: 'operator', label: '操作员' },
      ];

      mockRoleService.getRoleTypes.mockResolvedValue(roleTypes);

      const result = await controller.getRoleTypes();

      expect(roleService.getRoleTypes).toHaveBeenCalled();
      expect(result).toEqual(roleTypes);
    });
  });
});
