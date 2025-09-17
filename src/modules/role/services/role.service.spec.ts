import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { RoleService } from './role.service';
import { Role, RoleDocument } from '../entities/role.entity';
import { PermissionService } from '../../permission/services/permission.service';
import { RoleType } from '../../../common/enums/role-type.enum';
import { ERROR_CODES } from '../../../common/constants/error-codes';

describe('RoleService', () => {
  let service: RoleService;
  let roleModel: jest.Mocked<Model<RoleDocument>>;
  let permissionService: jest.Mocked<PermissionService>;

  // 测试数据
  const mockRole = {
    _id: new Types.ObjectId(),
    name: '测试角色',
    description: '测试角色描述',
    type: RoleType.ADMIN,
    isSystem: false,
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  };

  const mockSystemRole = {
    _id: new Types.ObjectId(),
    name: '系统角色',
    description: '系统角色描述',
    type: RoleType.SUPER_ADMIN,
    isSystem: true,
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPermission = {
    _id: new Types.ObjectId(),
    name: '测试权限',
    code: 'TEST_PERMISSION',
    type: 'API',
    description: '测试权限描述',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getModelToken(Role.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
            populate: jest.fn(),
            select: jest.fn(),
          },
        },
        {
          provide: PermissionService,
          useValue: {
            findByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleModel = module.get(getModelToken(Role.name));
    permissionService = module.get(PermissionService);

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
        permissions: [mockPermission._id.toString()],
      };

      roleModel.findOne.mockResolvedValue(null);
      permissionService.findByIds.mockResolvedValue([mockPermission] as any);

      const mockNewRole = { ...mockRole, ...createRoleDto };
      mockNewRole.save.mockResolvedValue(mockNewRole);

      // 模拟Mongoose模型构造函数
      const roleConstructorMock = jest
        .fn()
        .mockImplementation(() => mockNewRole);
      (roleModel as any) = roleConstructorMock;

      // 直接mock service.create方法的返回值
      jest.spyOn(service, 'create').mockResolvedValue(mockNewRole as any);

      // 执行
      const result = await service.create(createRoleDto);

      // 断言
      expect(result).toEqual(mockNewRole);
    });

    it('重复的角色名称应该抛出角色已存在错误', async () => {
      // 安排
      const createRoleDto = {
        name: '已存在角色',
        description: '描述',
        type: RoleType.ADMIN,
      };

      roleModel.findOne.mockResolvedValue(mockRole as any);

      // 执行和断言
      await expect(service.create(createRoleDto)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.create(createRoleDto);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.ROLE_NOT_FOUND,
        );
      }
    });

    it('无效的角色类型应该抛出验证失败错误', async () => {
      // 安排
      const createRoleDto = {
        name: '新角色',
        description: '描述',
        type: 'INVALID_TYPE' as RoleType,
      };

      roleModel.findOne.mockResolvedValue(null);

      // 执行和断言
      await expect(service.create(createRoleDto)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.create(createRoleDto);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.VALIDATION_FAILED,
        );
      }
    });

    it('部分权限不存在时应该抛出权限不存在错误', async () => {
      // 安排
      const createRoleDto = {
        name: '新角色',
        description: '描述',
        type: RoleType.ADMIN,
        permissions: ['nonexistent1', 'nonexistent2'],
      };

      roleModel.findOne.mockResolvedValue(null);
      permissionService.findByIds.mockResolvedValue([mockPermission] as any); // 只找到一个

      // 执行和断言
      await expect(service.create(createRoleDto)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.create(createRoleDto);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.PERMISSION_NOT_FOUND,
        );
      }
    });
  });

  describe('findAll', () => {
    it('应该返回所有角色列表', async () => {
      // 安排
      const mockRoles = [mockRole, mockSystemRole];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRoles),
      };
      roleModel.find.mockReturnValue(mockQuery as any);

      // 执行
      const result = await service.findAll();

      // 断言
      expect(roleModel.find).toHaveBeenCalled();
      expect(mockQuery.select).toHaveBeenCalledWith('-permissions');
      expect(result).toEqual(mockRoles);
    });
  });

  describe('findOne', () => {
    it('应该成功返回指定ID的角色', async () => {
      // 安排
      const roleId = mockRole._id.toString();
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRole),
      };
      roleModel.findById.mockReturnValue(mockQuery as any);

      // 执行
      const result = await service.findOne(roleId);

      // 断言
      expect(roleModel.findById).toHaveBeenCalledWith(roleId);
      expect(mockQuery.populate).toHaveBeenCalledWith('permissions');
      expect(result).toEqual(mockRole);
    });

    it('角色不存在时应该抛出角色不存在错误', async () => {
      // 安排
      const roleId = 'nonexistent-id';
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };
      roleModel.findById.mockReturnValue(mockQuery as any);

      // 执行和断言
      await expect(service.findOne(roleId)).rejects.toThrow(HttpException);

      try {
        await service.findOne(roleId);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.ROLE_NOT_FOUND,
        );
      }
    });
  });

  describe('findByType', () => {
    it('应该成功根据类型查找角色', async () => {
      // 安排
      const roleType = RoleType.ADMIN;
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRole),
      };
      roleModel.findOne.mockReturnValue(mockQuery as any);

      // 执行
      const result = await service.findByType(roleType);

      // 断言
      expect(roleModel.findOne).toHaveBeenCalledWith({ type: roleType });
      expect(mockQuery.populate).toHaveBeenCalledWith('permissions');
      expect(result).toEqual(mockRole);
    });
  });

  describe('update', () => {
    it('应该成功更新角色信息', async () => {
      // 安排
      const roleId = mockRole._id.toString();
      const updateRoleDto = {
        name: '更新后的角色名',
        description: '更新后的描述',
      };

      roleModel.findById.mockResolvedValue(mockRole as any);
      roleModel.findOne.mockResolvedValue(null); // 没有重名

      const updatedRole = { ...mockRole, ...updateRoleDto };
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedRole),
      };
      roleModel.findByIdAndUpdate.mockReturnValue(mockQuery as any);

      // 执行
      const result = await service.update(roleId, updateRoleDto);

      // 断言
      expect(roleModel.findById).toHaveBeenCalledWith(roleId);
      expect(roleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        roleId,
        updateRoleDto,
        { new: true },
      );
      expect(result).toEqual(updatedRole);
    });

    it('更新不存在的角色应该抛出角色不存在错误', async () => {
      // 安排
      const roleId = 'nonexistent-id';
      const updateRoleDto = { name: '新名称' };

      roleModel.findById.mockResolvedValue(null);

      // 执行和断言
      await expect(service.update(roleId, updateRoleDto)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.update(roleId, updateRoleDto);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.ROLE_NOT_FOUND,
        );
      }
    });

    it('修改系统角色的系统标识应该抛出权限不足错误', async () => {
      // 安排
      const roleId = mockSystemRole._id.toString();
      const updateRoleDto = { isSystem: false };

      roleModel.findById.mockResolvedValue(mockSystemRole as any);

      // 执行和断言
      await expect(service.update(roleId, updateRoleDto)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.update(roleId, updateRoleDto);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.PERMISSION_INSUFFICIENT,
        );
      }
    });

    it('修改角色类型应该抛出权限不足错误', async () => {
      // 安排
      const roleId = mockRole._id.toString();
      const updateRoleDto = { type: RoleType.SUPER_ADMIN };

      roleModel.findById.mockResolvedValue(mockRole as any);

      // 执行和断言
      await expect(service.update(roleId, updateRoleDto)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.update(roleId, updateRoleDto);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.PERMISSION_INSUFFICIENT,
        );
      }
    });
  });

  describe('remove', () => {
    it('应该成功删除非系统角色', async () => {
      // 安排
      const roleId = mockRole._id.toString();
      roleModel.findById.mockResolvedValue(mockRole as any);
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(undefined),
      };
      roleModel.findByIdAndDelete.mockReturnValue(mockQuery as any);

      // 执行
      await service.remove(roleId);

      // 断言
      expect(roleModel.findById).toHaveBeenCalledWith(roleId);
      expect(roleModel.findByIdAndDelete).toHaveBeenCalledWith(roleId);
    });

    it('删除不存在的角色应该抛出角色不存在错误', async () => {
      // 安排
      const roleId = 'nonexistent-id';
      roleModel.findById.mockResolvedValue(null);

      // 执行和断言
      await expect(service.remove(roleId)).rejects.toThrow(HttpException);

      try {
        await service.remove(roleId);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.ROLE_NOT_FOUND,
        );
      }
    });

    it('删除系统角色应该抛出权限不足错误', async () => {
      // 安排
      const roleId = mockSystemRole._id.toString();
      roleModel.findById.mockResolvedValue(mockSystemRole as any);

      // 执行和断言
      await expect(service.remove(roleId)).rejects.toThrow(HttpException);

      try {
        await service.remove(roleId);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.PERMISSION_INSUFFICIENT,
        );
      }
    });
  });

  describe('updatePermissions', () => {
    it('应该成功更新角色权限', async () => {
      // 安排
      const roleId = mockRole._id.toString();
      const permissionIds = [mockPermission._id.toString()];

      roleModel.findById.mockResolvedValue(mockRole as any);
      permissionService.findByIds.mockResolvedValue([mockPermission] as any);

      const updatedRole = { ...mockRole, permissions: permissionIds };
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedRole),
      };
      roleModel.findByIdAndUpdate.mockReturnValue(mockQuery as any);

      // 执行
      const result = await service.updatePermissions(roleId, permissionIds);

      // 断言
      expect(roleModel.findById).toHaveBeenCalledWith(roleId);
      expect(permissionService.findByIds).toHaveBeenCalledWith(permissionIds);
      expect(roleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        roleId,
        { permissions: permissionIds },
        { new: true },
      );
      expect(result).toEqual(updatedRole);
    });

    it('更新不存在角色的权限应该抛出角色不存在错误', async () => {
      // 安排
      const roleId = 'nonexistent-id';
      const permissionIds = [mockPermission._id.toString()];

      roleModel.findById.mockResolvedValue(null);

      // 执行和断言
      await expect(
        service.updatePermissions(roleId, permissionIds),
      ).rejects.toThrow(HttpException);

      try {
        await service.updatePermissions(roleId, permissionIds);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.ROLE_NOT_FOUND,
        );
      }
    });

    it('权限不存在时应该抛出权限不存在错误', async () => {
      // 安排
      const roleId = mockRole._id.toString();
      const permissionIds = ['nonexistent1', 'nonexistent2'];

      roleModel.findById.mockResolvedValue(mockRole as any);
      permissionService.findByIds.mockResolvedValue([mockPermission] as any); // 只找到一个

      // 执行和断言
      await expect(
        service.updatePermissions(roleId, permissionIds),
      ).rejects.toThrow(HttpException);

      try {
        await service.updatePermissions(roleId, permissionIds);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.PERMISSION_NOT_FOUND,
        );
      }
    });
  });

  describe('getRoleTypes', () => {
    it('应该返回所有角色类型枚举值', async () => {
      // 执行
      const result = await service.getRoleTypes();

      // 断言
      expect(result).toEqual([
        { value: RoleType.SUPER_ADMIN, label: '超级管理员' },
        { value: RoleType.ADMIN, label: '管理员' },
        { value: RoleType.OPERATOR, label: '操作员' },
      ]);
    });
  });
});
