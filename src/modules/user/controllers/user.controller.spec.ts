import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UpdatePermissionsDto } from '../dto/update-permissions.dto';
import { BatchOperationDto, BatchUpdateStatusDto } from '../dto/batch-operation.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    realName: '测试用户',
    role: 'admin',
    status: 'active',
    permissions: ['user:read'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserList = {
    data: [mockUser],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(async () => {
    const mockUserService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      updateStatus: jest.fn(),
      resetPassword: jest.fn(),
      updatePermissions: jest.fn(),
      getUserPermissions: jest.fn(),
      batchUpdateStatus: jest.fn(),
      batchDelete: jest.fn(),
      deleteById: jest.fn(),
      updateUserStatus: jest.fn(),
      resetUserPassword: jest.fn(),
      batchDeleteUsers: jest.fn(),
      getUserMenus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return user list', async () => {
      const query: QueryUserDto = { page: 1, limit: 10 };
      userService.findAll.mockResolvedValue(mockUserList);

      const result = await controller.findAll(query);

      expect(userService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockUserList);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      userService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(userService.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockUser);
    });

    it('should throw HttpException when user not found', async () => {
      userService.findById.mockResolvedValue(null);

      await expect(controller.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        new HttpException('用户不存在', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'Password123!',
        email: 'newuser@example.com',
        realName: '新用户',
        role: 'admin',
      };
      userService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        realName: '更新用户',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };
      userService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(
        '507f1f77bcf86cd799439011',
        updateUserDto,
        'different-user-id',
      );

      expect(userService.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should prevent user from updating own role and status', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        role: 'super_admin',
        status: 'inactive',
      };
      const expectedDto = { email: 'updated@example.com' };
      userService.update.mockResolvedValue(mockUser);

      await controller.update('507f1f77bcf86cd799439011', updateUserDto, '507f1f77bcf86cd799439011');

      expect(userService.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', expectedDto);
    });
  });

  describe('remove', () => {
    it('should delete user successfully', async () => {
      userService.remove.mockResolvedValue();

      const result = await controller.remove('507f1f77bcf86cd799439011', 'different-user-id');

      expect(userService.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual({ message: '删除用户成功' });
    });

    it('should prevent user from deleting themselves', async () => {
      await expect(
        controller.remove('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439011'),
      ).rejects.toThrow(new HttpException('不能删除自己的账户', HttpStatus.BAD_REQUEST));
    });
  });

  describe('updateStatus', () => {
    it('should update user status successfully', async () => {
      const updateStatusDto: UpdateUserStatusDto = { status: 'inactive' };
      const updatedUser = { ...mockUser, status: 'inactive' };
      userService.updateStatus.mockResolvedValue(updatedUser);

      const result = await controller.updateStatus(
        '507f1f77bcf86cd799439011',
        updateStatusDto,
        'different-user-id',
      );

      expect(userService.updateStatus).toHaveBeenCalledWith('507f1f77bcf86cd799439011', 'inactive');
      expect(result).toEqual(updatedUser);
    });

    it('should prevent user from updating own status', async () => {
      const updateStatusDto: UpdateUserStatusDto = { status: 'inactive' };

      await expect(
        controller.updateStatus('507f1f77bcf86cd799439011', updateStatusDto, '507f1f77bcf86cd799439011'),
      ).rejects.toThrow(new HttpException('不能修改自己的状态', HttpStatus.BAD_REQUEST));
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        newPassword: 'NewPassword123!',
        sendEmail: false,
      };
      const resetResult = { message: '密码重置成功' };
      userService.resetPassword.mockResolvedValue(resetResult);

      const result = await controller.resetPassword('507f1f77bcf86cd799439011', resetPasswordDto);

      expect(userService.resetPassword).toHaveBeenCalledWith('507f1f77bcf86cd799439011', resetPasswordDto);
      expect(result).toEqual(resetResult);
    });
  });

  describe('updatePermissions', () => {
    it('should update user permissions successfully', async () => {
      const updatePermissionsDto: UpdatePermissionsDto = {
        permissions: ['user:read', 'user:write'],
      };
      const updatedUser = { ...mockUser, permissions: ['user:read', 'user:write'] };
      userService.updatePermissions.mockResolvedValue(updatedUser);

      const result = await controller.updatePermissions('507f1f77bcf86cd799439011', updatePermissionsDto);

      expect(userService.updatePermissions).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        ['user:read', 'user:write'],
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('getUserPermissions', () => {
    it('should return user permissions', async () => {
      const permissions = ['user:read', 'user:write'];
      userService.getUserPermissions.mockResolvedValue(permissions);

      const result = await controller.getUserPermissions('507f1f77bcf86cd799439011');

      expect(userService.getUserPermissions).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual({ permissions });
    });
  });

  describe('batchUpdateStatus', () => {
    it('should batch update user status successfully', async () => {
      const batchUpdateStatusDto: BatchUpdateStatusDto = {
        userIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        status: 'inactive',
      };
      const batchResult = { modifiedCount: 2 };
      userService.batchUpdateStatus.mockResolvedValue(batchResult);

      const result = await controller.batchUpdateStatus(batchUpdateStatusDto, 'different-user-id');

      expect(userService.batchUpdateStatus).toHaveBeenCalledWith(
        ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        'inactive',
      );
      expect(result).toEqual({
        message: '批量更新用户状态成功',
        modifiedCount: 2,
      });
    });

    it('should filter out current user ID', async () => {
      const batchUpdateStatusDto: BatchUpdateStatusDto = {
        userIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        status: 'inactive',
      };
      const batchResult = { modifiedCount: 1 };
      userService.batchUpdateStatus.mockResolvedValue(batchResult);

      await controller.batchUpdateStatus(batchUpdateStatusDto, '507f1f77bcf86cd799439011');

      expect(userService.batchUpdateStatus).toHaveBeenCalledWith(['507f1f77bcf86cd799439012'], 'inactive');
    });
  });

  describe('batchDelete', () => {
    it('should batch delete users successfully', async () => {
      const batchOperationDto: BatchOperationDto = {
        userIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };
      const batchResult = { deletedCount: 2 };
      userService.batchDelete.mockResolvedValue(batchResult);

      const result = await controller.batchDelete(batchOperationDto, 'different-user-id');

      expect(userService.batchDelete).toHaveBeenCalledWith(
        ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        'different-user-id',
      );
      expect(result).toEqual({
        message: '批量删除用户成功',
        deletedCount: 2,
      });
    });
  });

  describe('findById', () => {
    it('should return user by id (alias method)', async () => {
      userService.findById.mockResolvedValue(mockUser);

      const result = await controller.findById('507f1f77bcf86cd799439011');

      expect(userService.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockUser);
    });
  });

  describe('deleteById', () => {
    it('should delete user by id successfully', async () => {
      userService.deleteById.mockResolvedValue();

      const result = await controller.deleteById('507f1f77bcf86cd799439011', 'different-user-id');

      expect(userService.deleteById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual({ message: '用户删除成功' });
    });

    it('should prevent user from deleting themselves', async () => {
      await expect(
        controller.deleteById('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439011'),
      ).rejects.toThrow(new HttpException('不能删除自己的账户', HttpStatus.BAD_REQUEST));
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status successfully (alias method)', async () => {
      const updateStatusDto: UpdateUserStatusDto = { status: 'inactive' };
      const updatedUser = { ...mockUser, status: 'inactive' };
      userService.updateUserStatus.mockResolvedValue(updatedUser);

      const result = await controller.updateUserStatus(
        '507f1f77bcf86cd799439011',
        updateStatusDto,
        'different-user-id',
      );

      expect(userService.updateUserStatus).toHaveBeenCalledWith('507f1f77bcf86cd799439011', 'inactive');
      expect(result).toEqual(updatedUser);
    });
  });

  describe('resetUserPassword', () => {
    it('should reset user password successfully (alias method)', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        newPassword: 'NewPassword123!',
        sendEmail: false,
      };
      const resetResult = { message: '密码重置成功' };
      userService.resetUserPassword.mockResolvedValue(resetResult);

      const result = await controller.resetUserPassword('507f1f77bcf86cd799439011', resetPasswordDto);

      expect(userService.resetUserPassword).toHaveBeenCalledWith('507f1f77bcf86cd799439011', resetPasswordDto);
      expect(result).toEqual(resetResult);
    });
  });

  describe('batchDeleteUsers', () => {
    it('should batch delete users successfully (alias method)', async () => {
      const batchOperationDto: BatchOperationDto = {
        userIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };
      const batchResult = { deletedCount: 2 };
      userService.batchDeleteUsers.mockResolvedValue(batchResult);

      const result = await controller.batchDeleteUsers(batchOperationDto, 'different-user-id');

      expect(userService.batchDeleteUsers).toHaveBeenCalledWith(
        ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        'different-user-id',
      );
      expect(result).toEqual({
        message: '批量删除用户成功',
        deletedCount: 2,
      });
    });
  });

  describe('getUserMenus', () => {
    it('should return user menus', async () => {
      const menuResult = {
        permissions: ['user:read', 'user:write'],
        menus: [
          {
            id: 'user',
            name: '用户管理',
            path: '/user',
            children: [],
          },
        ],
      };
      userService.getUserMenus.mockResolvedValue(menuResult);

      const result = await controller.getUserMenus('507f1f77bcf86cd799439011');

      expect(userService.getUserMenus).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(menuResult);
    });
  });
});