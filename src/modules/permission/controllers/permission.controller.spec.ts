import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionService } from '../services/permission.service';
import { PermissionType } from '../../../common/decorators/roles.decorator';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { Types } from 'mongoose';

describe('PermissionController', () => {
  let controller: PermissionController;
  let permissionService: jest.Mocked<PermissionService>;

  // 测试数据
  const mockPermission = {
    _id: new Types.ObjectId(),
    id: new Types.ObjectId().toString(),
    name: '用户管理',
    description: '用户管理权限',
    type: PermissionType.API,
    module: 'user',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPermissionList = [
    {
      id: new Types.ObjectId().toString(),
      name: '用户管理',
      description: '用户管理权限',
      type: PermissionType.API,
      module: 'user',
      status: 'active',
      createdAt: new Date(),
    },
    {
      id: new Types.ObjectId().toString(),
      name: '角色管理',
      description: '角色管理权限',
      type: PermissionType.API,
      module: 'role',
      status: 'active',
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        {
          provide: PermissionService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findByModule: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PermissionController>(PermissionController);
    permissionService = module.get(PermissionService);

    // 重置所有 mock
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建权限', async () => {
      // 安排
      const createPermissionDto = {
        name: '新权限',
        description: '新权限描述',
        type: PermissionType.API,
        module: 'test',
      };

      permissionService.create.mockResolvedValue(mockPermission as any);

      // 执行
      const result = await controller.create(createPermissionDto);

      // 断言
      expect(permissionService.create).toHaveBeenCalledWith(
        createPermissionDto,
      );
      expect(result).toEqual(mockPermission);
    });

    it('重复的权限名称应该传递服务层的错误', async () => {
      // 安排
      const createPermissionDto = {
        name: '已存在权限',
        description: '描述',
        type: PermissionType.API,
      };

      const expectedError = new HttpException(
        '权限已存在',
        ERROR_CODES.PERMISSION_ALREADY_EXISTS,
      );
      permissionService.create.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.create(createPermissionDto)).rejects.toThrow(
        expectedError,
      );
    });

    it('无效的权限类型应该传递服务层的错误', async () => {
      // 安排
      const createPermissionDto = {
        name: '新权限',
        description: '描述',
        type: 'INVALID_TYPE' as PermissionType,
      };

      const expectedError = new HttpException(
        '无效的权限类型',
        ERROR_CODES.VALIDATION_FAILED,
      );
      permissionService.create.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.create(createPermissionDto)).rejects.toThrow(
        expectedError,
      );
    });
  });

  describe('findAll', () => {
    it('应该返回所有权限列表', async () => {
      // 安排
      permissionService.findAll.mockResolvedValue(mockPermissionList as any);

      // 执行
      const result = await controller.findAll();

      // 断言
      expect(permissionService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockPermissionList);
      expect(result).toHaveLength(2);
    });

    it('应该根据类型过滤权限列表', async () => {
      // 安排
      const filteredPermissions = [mockPermissionList[0]];
      permissionService.findAll.mockResolvedValue(filteredPermissions as any);

      // 执行
      const result = await controller.findAll(PermissionType.API);

      // 断言
      expect(permissionService.findAll).toHaveBeenCalled();
      expect(result).toEqual(filteredPermissions);
      expect(result).toHaveLength(1);
    });
  });

  describe('remove', () => {
    it('应该成功删除权限', async () => {
      // 安排
      const permissionId = mockPermission._id.toString();
      permissionService.remove.mockResolvedValue(undefined);

      // 执行
      const result = await controller.remove(permissionId);

      // 断言
      expect(permissionService.remove).toHaveBeenCalledWith(permissionId);
      expect(result).toBeUndefined();
    });

    it('删除不存在的权限应该传递服务层的错误', async () => {
      // 安排
      const permissionId = 'nonexistent-id';
      const expectedError = new HttpException(
        '权限不存在',
        ERROR_CODES.PERMISSION_NOT_FOUND,
      );
      permissionService.remove.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.remove(permissionId)).rejects.toThrow(
        expectedError,
      );
    });
  });

  describe('update', () => {
    it('应该成功更新权限信息', async () => {
      // 安排
      const updatePermissionDto = {
        id: mockPermission._id.toString(),
        name: '更新后的权限名',
        description: '更新后的描述',
      };

      const updatedPermission = { ...mockPermission, ...updatePermissionDto };
      permissionService.update.mockResolvedValue(updatedPermission as any);

      // 执行
      const result = await controller.update(updatePermissionDto);

      // 断言
      const { id, ...updateData } = updatePermissionDto;
      expect(permissionService.update).toHaveBeenCalledWith(id, updateData);
      expect(result).toEqual(updatedPermission);
    });

    it('更新不存在的权限应该传递服务层的错误', async () => {
      // 安排
      const updatePermissionDto = {
        id: 'nonexistent-id',
        name: '更新权限',
        description: '描述',
      };

      const expectedError = new HttpException(
        '权限不存在',
        ERROR_CODES.PERMISSION_NOT_FOUND,
      );
      permissionService.update.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.update(updatePermissionDto)).rejects.toThrow(
        expectedError,
      );
    });

    it('更新为重复权限名称应该传递服务层的错误', async () => {
      // 安排
      const updatePermissionDto = {
        id: mockPermission._id.toString(),
        name: '重复的权限名',
      };

      const expectedError = new HttpException(
        '权限名称已存在',
        ERROR_CODES.PERMISSION_ALREADY_EXISTS,
      );
      permissionService.update.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.update(updatePermissionDto)).rejects.toThrow(
        expectedError,
      );
    });
  });
});
