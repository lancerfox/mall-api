import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from '../services/role.service';
import { RoleType } from '../../../common/enums/role-type.enum';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { Types } from 'mongoose';

describe('RoleController', () => {
  let controller: RoleController;
  let roleService: jest.Mocked<RoleService>;

  // 测试数据
  const mockRole = {
    _id: new Types.ObjectId(),
    id: new Types.ObjectId().toString(),
    name: '测试角色',
    description: '测试角色描述',
    type: RoleType.ADMIN,
    isSystem: false,
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRoleList = [
    {
      id: new Types.ObjectId().toString(),
      name: '管理员',
      description: '管理员角色',
      type: RoleType.ADMIN,
      isSystem: false,
      createdAt: new Date(),
    },
    {
      id: new Types.ObjectId().toString(),
      name: '操作员',
      description: '操作员角色',
      type: RoleType.OPERATOR,
      isSystem: false,
      createdAt: new Date(),
    },
  ];

  const mockPermissions = [
    {
      id: new Types.ObjectId().toString(),
      name: '用户管理',
      description: '用户管理权限',
      code: 'USER_MANAGE',
      type: 'API',
    },
    {
      id: new Types.ObjectId().toString(),
      name: '角色管理',
      description: '角色管理权限',
      code: 'ROLE_MANAGE',
      type: 'API',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            updatePermissions: jest.fn(),
            findPermissionsByRoleId: jest.fn(),
            getRoleTypes: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
    roleService = module.get(RoleService);

    // 重置所有 mock
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建角色', async () => {
      // 安排
      const createRoleDto = {
        name: '新角色',
        description: '新角色描述',
        type: RoleType.ADMIN,
        permissions: [],
      };

      roleService.create.mockResolvedValue(mockRole as any);

      // 执行
      const result = await controller.create(createRoleDto);

      // 断言
      expect(roleService.create).toHaveBeenCalledWith(createRoleDto);
      expect(result).toEqual(mockRole);
    });

    it('重复的角色名称应该传递服务层的错误', async () => {
      // 安排
      const createRoleDto = {
        name: '已存在角色',
        description: '描述',
        type: RoleType.ADMIN,
      };

      const expectedError = new HttpException(
        '角色名称已存在',
        ERROR_CODES.ROLE_NOT_FOUND,
      );
      roleService.create.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.create(createRoleDto)).rejects.toThrow(
        expectedError,
      );
    });

    it('无效的角色类型应该传递服务层的错误', async () => {
      // 安排
      const createRoleDto = {
        name: '新角色',
        description: '描述',
        type: 'INVALID_TYPE' as RoleType,
      };

      const expectedError = new HttpException(
        '无效的角色类型',
        ERROR_CODES.VALIDATION_FAILED,
      );
      roleService.create.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.create(createRoleDto)).rejects.toThrow(
        expectedError,
      );
    });
  });

  describe('findAll', () => {
    it('应该返回所有角色列表', async () => {
      // 安排
      roleService.findAll.mockResolvedValue(mockRoleList as any);

      // 执行
      const result = await controller.findAll();

      // 断言
      expect(roleService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockRoleList);
      expect(result).toHaveLength(2);
    });
  });

  describe('remove', () => {
    it('应该成功删除角色', async () => {
      // 安排
      const roleId = mockRole._id.toString();
      roleService.remove.mockResolvedValue(undefined);

      // 执行
      const result = await controller.remove(roleId);

      // 断言
      expect(roleService.remove).toHaveBeenCalledWith(roleId);
      expect(result).toBeUndefined();
    });

    it('删除不存在的角色应该传递服务层的错误', async () => {
      // 安排
      const roleId = 'nonexistent-id';
      const expectedError = new HttpException(
        '角色不存在',
        ERROR_CODES.ROLE_NOT_FOUND,
      );
      roleService.remove.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.remove(roleId)).rejects.toThrow(expectedError);
    });

    it('删除系统角色应该传递服务层的错误', async () => {
      // 安排
      const roleId = mockRole._id.toString();
      const expectedError = new HttpException(
        '系统角色不能删除',
        ERROR_CODES.PERMISSION_INSUFFICIENT,
      );
      roleService.remove.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.remove(roleId)).rejects.toThrow(expectedError);
    });
  });

  describe('updatePermissions', () => {
    it('应该成功更新角色权限', async () => {
      // 安排
      const roleId = mockRole._id.toString();
      const permissionIds = [mockPermissions[0].id, mockPermissions[1].id];
      const updatedRole = { ...mockRole, permissions: permissionIds };

      roleService.updatePermissions.mockResolvedValue(updatedRole as any);

      // 执行
      const result = await controller.updatePermissions(roleId, permissionIds);

      // 断言
      expect(roleService.updatePermissions).toHaveBeenCalledWith(
        roleId,
        permissionIds,
      );
      expect(result).toEqual(updatedRole);
    });

    it('更新不存在角色的权限应该传递服务层的错误', async () => {
      // 安排
      const roleId = 'nonexistent-id';
      const permissionIds = [mockPermissions[0].id];
      const expectedError = new HttpException(
        '角色不存在',
        ERROR_CODES.ROLE_NOT_FOUND,
      );
      roleService.updatePermissions.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(
        controller.updatePermissions(roleId, permissionIds),
      ).rejects.toThrow(expectedError);
    });

    it('权限不存在时应该传递服务层的错误', async () => {
      // 安排
      const roleId = mockRole._id.toString();
      const permissionIds = ['nonexistent-permission'];
      const expectedError = new HttpException(
        '部分权限不存在',
        ERROR_CODES.PERMISSION_NOT_FOUND,
      );
      roleService.updatePermissions.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(
        controller.updatePermissions(roleId, permissionIds),
      ).rejects.toThrow(expectedError);
    });
  });

  describe('update', () => {
    it('应该成功更新角色信息', async () => {
      // 安排
      const updateRoleDto = {
        id: mockRole._id.toString(),
        name: '更新后的角色名',
        description: '更新后的描述',
      };

      const updatedRole = { ...mockRole, ...updateRoleDto };
      roleService.update.mockResolvedValue(updatedRole as any);

      // 执行
      const result = await controller.update(updateRoleDto);

      // 断言
      expect(roleService.update).toHaveBeenCalledWith(
        updateRoleDto.id,
        updateRoleDto,
      );
      expect(result).toEqual(updatedRole);
    });

    it('更新不存在的角色应该传递服务层的错误', async () => {
      // 安排
      const updateRoleDto = {
        id: 'nonexistent-id',
        name: '新名称',
      };

      const expectedError = new HttpException(
        '角色不存在',
        ERROR_CODES.ROLE_NOT_FOUND,
      );
      roleService.update.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.update(updateRoleDto)).rejects.toThrow(
        expectedError,
      );
    });

    it('修改角色类型应该传递服务层的错误', async () => {
      // 安排
      const updateRoleDto = {
        id: mockRole._id.toString(),
        type: RoleType.SUPER_ADMIN,
      };

      const expectedError = new HttpException(
        '角色类型不允许修改',
        ERROR_CODES.PERMISSION_INSUFFICIENT,
      );
      roleService.update.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.update(updateRoleDto)).rejects.toThrow(
        expectedError,
      );
    });
  });

  describe('getPermissions', () => {
    it('应该返回角色的所有权限', async () => {
      // 安排
      const roleId = mockRole._id.toString();
      roleService.findPermissionsByRoleId.mockResolvedValue(mockPermissions);

      // 执行
      const result = await controller.getPermissions(roleId);

      // 断言
      expect(roleService.findPermissionsByRoleId).toHaveBeenCalledWith(
        roleId,
        undefined,
      );
      expect(result).toEqual(mockPermissions);
      expect(result).toHaveLength(2);
    });

    it('应该返回指定类型的角色权限', async () => {
      // 安排
      const roleId = mockRole._id.toString();
      const type = 'API';
      const filteredPermissions = mockPermissions.filter(
        (p) => p.type === type,
      );
      roleService.findPermissionsByRoleId.mockResolvedValue(
        filteredPermissions,
      );

      // 执行
      const result = await controller.getPermissions(roleId, type);

      // 断言
      expect(roleService.findPermissionsByRoleId).toHaveBeenCalledWith(
        roleId,
        type,
      );
      expect(result).toEqual(filteredPermissions);
      expect(result.every((p) => p.type === type)).toBe(true);
    });

    it('查询不存在角色的权限应该传递服务层的错误', async () => {
      // 安排
      const roleId = 'nonexistent-id';
      const expectedError = new HttpException(
        '角色不存在',
        ERROR_CODES.ROLE_NOT_FOUND,
      );
      roleService.findPermissionsByRoleId.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.getPermissions(roleId)).rejects.toThrow(
        expectedError,
      );
    });
  });

  describe('getRoleTypes', () => {
    it('应该返回所有角色类型枚举值', async () => {
      // 安排
      const expectedRoleTypes = [
        { value: RoleType.SUPER_ADMIN, label: '超级管理员' },
        { value: RoleType.ADMIN, label: '管理员' },
        { value: RoleType.OPERATOR, label: '操作员' },
      ];
      roleService.getRoleTypes.mockResolvedValue(expectedRoleTypes);

      // 执行
      const result = await controller.getRoleTypes();

      // 断言
      expect(roleService.getRoleTypes).toHaveBeenCalled();
      expect(result).toEqual(expectedRoleTypes);
      expect(result).toHaveLength(3);
      expect(result.every((type) => type.value && type.label)).toBe(true);
    });
  });
});
