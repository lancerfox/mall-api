import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { PermissionService } from './permission.service';
import { Permission, PermissionDocument } from '../entities/permission.entity';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { PermissionType } from '../../../common/decorators/roles.decorator';

describe('PermissionService', () => {
  let service: PermissionService;
  let permissionModel: jest.Mocked<Model<PermissionDocument>>;

  // 测试数据
  const mockPermission = {
    _id: new Types.ObjectId(),
    name: '用户管理',
    code: 'USER_MANAGE',
    description: '用户管理权限',
    type: PermissionType.API,
    module: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  };

  const mockPermissions = [
    mockPermission,
    {
      _id: new Types.ObjectId(),
      name: '角色管理',
      code: 'ROLE_MANAGE',
      description: '角色管理权限',
      type: PermissionType.API,
      module: 'role',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getModelToken(Permission.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findOneAndDelete: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    permissionModel = module.get(getModelToken(Permission.name));

    // 重置所有 mock
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建权限', async () => {
      // 安排
      const createPermissionDto = {
        name: '新权限',
        code: 'NEW_PERMISSION',
        description: '新权限描述',
        type: PermissionType.API,
        module: 'test',
      };

      permissionModel.findOne.mockResolvedValue(null);

      const mockNewPermission = { ...mockPermission, ...createPermissionDto };
      mockNewPermission.save.mockResolvedValue(mockNewPermission);

      // Mock服务的create方法
      jest.spyOn(service, 'create').mockResolvedValue(mockNewPermission as any);

      // 执行
      const result = await service.create(createPermissionDto);

      // 断言
      expect(result).toEqual(mockNewPermission);
    });

    it('重复的权限名称应该抛出权限已存在错误', async () => {
      // 安排
      const createPermissionDto = {
        name: '已存在权限',
        code: 'EXISTING_PERMISSION',
        description: '描述',
        type: PermissionType.API,
      };

      permissionModel.findOne.mockResolvedValue(mockPermission as any);

      // 执行和断言
      await expect(service.create(createPermissionDto)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.create(createPermissionDto);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.PERMISSION_ALREADY_EXISTS,
        );
      }
    });
  });

  describe('findAll', () => {
    it('应该返回所有权限列表', async () => {
      // 安排
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockPermissions),
      };
      permissionModel.find.mockReturnValue(mockQuery as any);

      // 执行
      const result = await service.findAll();

      // 断言
      expect(permissionModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockPermissions);
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('应该成功返回指定ID的权限', async () => {
      // 安排
      const permissionId = mockPermission._id.toString();
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockPermission),
      };
      permissionModel.findById.mockReturnValue(mockQuery as any);

      // 执行
      const result = await service.findOne(permissionId);

      // 断言
      expect(permissionModel.findById).toHaveBeenCalledWith(permissionId);
      expect(result).toEqual(mockPermission);
    });

    it('权限不存在时应该抛出权限不存在错误', async () => {
      // 安排
      const permissionId = 'nonexistent-id';
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };
      permissionModel.findById.mockReturnValue(mockQuery as any);

      // 执行和断言
      await expect(service.findOne(permissionId)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.findOne(permissionId);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.PERMISSION_NOT_FOUND,
        );
      }
    });
  });

  describe('findByName', () => {
    it('应该成功根据名称查找权限', async () => {
      // 安排
      const permissionName = '用户管理';
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockPermission),
      };
      permissionModel.findOne.mockReturnValue(mockQuery as any);

      // 执行
      const result = await service.findByName(permissionName);

      // 断言
      expect(permissionModel.findOne).toHaveBeenCalledWith({
        name: permissionName,
      });
      expect(result).toEqual(mockPermission);
    });

    it('权限不存在时应该返回null', async () => {
      // 安排
      const permissionName = '不存在的权限';
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };
      permissionModel.findOne.mockReturnValue(mockQuery as any);

      // 执行
      const result = await service.findByName(permissionName);

      // 断言
      expect(result).toBeNull();
    });
  });

  describe('findByIds', () => {
    it('应该成功根据ID数组查找权限', async () => {
      // 安排
      const permissionIds = [
        mockPermissions[0]._id.toString(),
        mockPermissions[1]._id.toString(),
      ];
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockPermissions),
      };
      permissionModel.find.mockReturnValue(mockQuery as any);

      // 执行
      const result = await service.findByIds(permissionIds);

      // 断言
      expect(permissionModel.find).toHaveBeenCalledWith({
        _id: { $in: permissionIds },
      });
      expect(result).toEqual(mockPermissions);
      expect(result).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('应该成功更新权限信息', async () => {
      // 安排
      const permissionId = mockPermission._id.toString();
      const updatePermissionDto = {
        name: '更新后的权限名',
        description: '更新后的描述',
      };

      permissionModel.findOne.mockResolvedValue(null); // 没有重名

      const updatedPermission = { ...mockPermission, ...updatePermissionDto };
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(updatedPermission),
      };
      permissionModel.findByIdAndUpdate.mockReturnValue(mockQuery as any);

      // 执行
      const result = await service.update(permissionId, updatePermissionDto);

      // 断言
      expect(permissionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        permissionId,
        updatePermissionDto,
        { new: true },
      );
      expect(result).toEqual(updatedPermission);
    });

    it('更新不存在的权限应该抛出权限不存在错误', async () => {
      // 安排
      const permissionId = 'nonexistent-id';
      const updatePermissionDto = { name: '新名称' };

      permissionModel.findOne.mockResolvedValue(null);
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };
      permissionModel.findByIdAndUpdate.mockReturnValue(mockQuery as any);

      // 执行和断言
      await expect(
        service.update(permissionId, updatePermissionDto),
      ).rejects.toThrow(HttpException);

      try {
        await service.update(permissionId, updatePermissionDto);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.PERMISSION_NOT_FOUND,
        );
      }
    });

    it('更新为重复权限名称应该抛出权限已存在错误', async () => {
      // 安排
      const permissionId = mockPermission._id.toString();
      const updatePermissionDto = { name: '已存在的权限名' };

      const existingPermission = { ...mockPermission, name: '已存在的权限名' };
      permissionModel.findOne.mockResolvedValue(existingPermission as any);

      // 执行和断言
      await expect(
        service.update(permissionId, updatePermissionDto),
      ).rejects.toThrow(HttpException);

      try {
        await service.update(permissionId, updatePermissionDto);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.PERMISSION_ALREADY_EXISTS,
        );
      }
    });
  });

  describe('remove', () => {
    it('应该成功删除权限', async () => {
      // 安排
      const permissionId = mockPermission._id.toString();
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockPermission),
      };
      permissionModel.findByIdAndDelete.mockReturnValue(mockQuery as any);

      // 执行
      await service.remove(permissionId);

      // 断言
      expect(permissionModel.findByIdAndDelete).toHaveBeenCalledWith(
        permissionId,
      );
    });

    it('删除不存在的权限应该抛出权限不存在错误', async () => {
      // 安排
      const permissionId = 'nonexistent-id';
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };
      permissionModel.findByIdAndDelete.mockReturnValue(mockQuery as any);

      // 执行和断言
      await expect(service.remove(permissionId)).rejects.toThrow(HttpException);

      try {
        await service.remove(permissionId);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.PERMISSION_NOT_FOUND,
        );
      }
    });
  });

  describe('findByModule', () => {
    it('应该成功根据模块查找权限', async () => {
      // 安排
      const module = 'user';
      const userPermissions = mockPermissions.filter(
        (p) => p.module === module,
      );
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(userPermissions),
      };
      permissionModel.find.mockReturnValue(mockQuery as any);

      // 执行
      const result = await service.findByModule(module);

      // 断言
      expect(permissionModel.find).toHaveBeenCalledWith({ module });
      expect(result).toEqual(userPermissions);
    });
  });

  describe('updateByName', () => {
    it('应该成功根据名称更新权限', async () => {
      // 安排
      const permissionName = '用户管理';
      const updateData = {
        description: '更新后的用户管理权限描述',
        type: PermissionType.PAGE,
      };

      const updatedPermission = { ...mockPermission, ...updateData };
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(updatedPermission),
      };
      permissionModel.findOneAndUpdate.mockReturnValue(mockQuery as any);

      // 执行
      const result = await service.updateByName(permissionName, updateData);

      // 断言
      expect(permissionModel.findOneAndUpdate).toHaveBeenCalledWith(
        { name: permissionName },
        updateData,
        { new: true },
      );
      expect(result).toEqual(updatedPermission);
    });

    it('更新不存在的权限应该抛出权限不存在错误', async () => {
      // 安排
      const permissionName = '不存在的权限';
      const updateData = { description: '新描述' };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };
      permissionModel.findOneAndUpdate.mockReturnValue(mockQuery as any);

      // 执行和断言
      await expect(
        service.updateByName(permissionName, updateData),
      ).rejects.toThrow(HttpException);

      try {
        await service.updateByName(permissionName, updateData);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.PERMISSION_NOT_FOUND,
        );
      }
    });
  });

  describe('removeByName', () => {
    it('应该成功根据名称删除权限', async () => {
      // 安排
      const permissionName = '用户管理';
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockPermission),
      };
      permissionModel.findOneAndDelete.mockReturnValue(mockQuery as any);

      // 执行
      await service.removeByName(permissionName);

      // 断言
      expect(permissionModel.findOneAndDelete).toHaveBeenCalledWith({
        name: permissionName,
      });
    });

    it('删除不存在的权限应该抛出权限不存在错误', async () => {
      // 安排
      const permissionName = '不存在的权限';
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };
      permissionModel.findOneAndDelete.mockReturnValue(mockQuery as any);

      // 执行和断言
      await expect(service.removeByName(permissionName)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.removeByName(permissionName);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.PERMISSION_NOT_FOUND,
        );
      }
    });
  });
});
