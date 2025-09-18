import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserWithIdDto } from '../dto/update-user-with-id.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { UserIdBodyDto } from '../dto/user-id-body.dto';
import { ERROR_CODES } from '../../../common/constants/error-codes';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUserResponse = {
    id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    roles: [
      {
        id: '507f1f77bcf86cd799439012',
        name: '普通用户',
        type: 'USER',
      },
    ],
    status: 'active',
    avatar: '',
    permissions: ['user:read', 'user:write'],
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isSuperAdmin: false,
  };

  const mockUserListResponse = {
    data: [mockUserResponse],
    total: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);

    // 重置所有mock
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('应该成功获取用户列表', async () => {
      // 安排
      const queryDto: QueryUserDto = {
        page: 1,
        pageSize: 10,
        username: 'test',
      };

      userService.findAll.mockResolvedValue(mockUserListResponse);

      // 执行
      const result = await controller.findAll(queryDto);

      // 断言
      expect(result).toEqual(mockUserListResponse);
      expect(userService.findAll).toHaveBeenCalledWith(queryDto);
    });

    it('应该正确传递查询参数', async () => {
      // 安排
      const queryDto: QueryUserDto = {
        page: 2,
        pageSize: 20,
        username: 'search',
        status: 'active' as any,
        roles: 'role123',
      };

      userService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        pageSize: 20,
        totalPages: 0,
      });

      // 执行
      await controller.findAll(queryDto);

      // 断言
      expect(userService.findAll).toHaveBeenCalledWith(queryDto);
    });

    it('服务抛出错误时应该传递错误', async () => {
      // 安排
      const queryDto: QueryUserDto = {
        page: 1,
        pageSize: 10,
      };

      const expectedError = new HttpException('数据库连接失败', 500);
      userService.findAll.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.findAll(queryDto)).rejects.toThrow(expectedError);
    });
  });

  describe('create', () => {
    it('应该成功创建用户', async () => {
      // 安排
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
        roles: ['507f1f77bcf86cd799439012'],
      };

      userService.create.mockResolvedValue(mockUserResponse);

      // 执行
      const result = await controller.create(createUserDto);

      // 断言
      expect(result).toEqual(mockUserResponse);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('用户名已存在时应该传递用户服务的错误', async () => {
      // 安排
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        password: 'password123',
        roles: [],
      };

      const expectedError = new HttpException(
        '用户名已存在',
        ERROR_CODES.USER_ALREADY_EXISTS,
      );
      userService.create.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.create(createUserDto)).rejects.toThrow(
        expectedError,
      );
    });

    it('角色不存在时应该传递用户服务的错误', async () => {
      // 安排
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
        roles: ['invalid-role-id'],
      };

      const expectedError = new HttpException(
        '部分角色不存在',
        ERROR_CODES.ROLE_NOT_FOUND,
      );
      userService.create.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.create(createUserDto)).rejects.toThrow(
        expectedError,
      );
    });
  });

  describe('update', () => {
    it('应该成功更新其他用户信息', async () => {
      // 安排
      const currentUserId = '507f1f77bcf86cd799439013'; // 不同于要更新的用户ID
      const updateUserWithIdDto: UpdateUserWithIdDto = {
        id: '507f1f77bcf86cd799439011',
        roles: ['507f1f77bcf86cd799439012'],
        status: 'active' as any,
      };

      const updatedUser = { ...mockUserResponse, status: 'active' };
      userService.update.mockResolvedValue(updatedUser);

      // 执行
      const result = await controller.update(
        updateUserWithIdDto,
        currentUserId,
      );

      // 断言
      expect(result).toEqual(updatedUser);
      expect(userService.update).toHaveBeenCalledWith(updateUserWithIdDto.id, {
        roles: updateUserWithIdDto.roles,
        status: updateUserWithIdDto.status,
      });
    });

    it('用户更新自己时应该过滤角色和状态字段', async () => {
      // 安排
      const currentUserId = '507f1f77bcf86cd799439011';
      const updateUserWithIdDto: UpdateUserWithIdDto = {
        id: '507f1f77bcf86cd799439011', // 相同用户ID
        roles: ['507f1f77bcf86cd799439012'],
        status: 'inactive' as any,
        avatar: 'new-avatar.jpg',
      };

      const updatedUser = { ...mockUserResponse, avatar: 'new-avatar.jpg' };
      userService.update.mockResolvedValue(updatedUser);

      // 执行
      const result = await controller.update(
        updateUserWithIdDto,
        currentUserId,
      );

      // 断言
      expect(result).toEqual(updatedUser);
      expect(userService.update).toHaveBeenCalledWith(updateUserWithIdDto.id, {
        avatar: 'new-avatar.jpg',
        // roles 和 status 应该被过滤掉
      });
    });

    it('用户不存在时应该传递用户服务的错误', async () => {
      // 安排
      const currentUserId = '507f1f77bcf86cd799439013';
      const updateUserWithIdDto: UpdateUserWithIdDto = {
        id: '507f1f77bcf86cd799439011',
        status: 'active' as any,
      };

      const expectedError = new HttpException(
        '用户不存在',
        ERROR_CODES.USER_NOT_FOUND,
      );
      userService.update.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(
        controller.update(updateUserWithIdDto, currentUserId),
      ).rejects.toThrow(expectedError);
    });

    it('更新失败时应该传递用户服务的错误', async () => {
      // 安排
      const currentUserId = '507f1f77bcf86cd799439013';
      const updateUserWithIdDto: UpdateUserWithIdDto = {
        id: '507f1f77bcf86cd799439011',
        roles: ['invalid-role-id'],
      };

      const expectedError = new HttpException(
        '部分角色不存在',
        ERROR_CODES.ROLE_NOT_FOUND,
      );
      userService.update.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(
        controller.update(updateUserWithIdDto, currentUserId),
      ).rejects.toThrow(expectedError);
    });
  });

  describe('remove', () => {
    it('应该成功删除其他用户', async () => {
      // 安排
      const currentUserId = '507f1f77bcf86cd799439013'; // 不同于要删除的用户ID
      const userIdDto: UserIdBodyDto = {
        id: '507f1f77bcf86cd799439011',
      };

      userService.remove.mockResolvedValue(undefined);

      // 执行
      const result = await controller.remove(userIdDto, currentUserId);

      // 断言
      expect(result).toEqual({ message: '删除用户成功' });
      expect(userService.remove).toHaveBeenCalledWith(userIdDto.id);
    });

    it('用户尝试删除自己时应该抛出权限不足错误', async () => {
      // 安排
      const currentUserId = '507f1f77bcf86cd799439011';
      const userIdDto: UserIdBodyDto = {
        id: '507f1f77bcf86cd799439011', // 相同用户ID
      };

      // 执行和断言
      await expect(controller.remove(userIdDto, currentUserId)).rejects.toThrow(
        HttpException,
      );

      try {
        await controller.remove(userIdDto, currentUserId);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.PERMISSION_INSUFFICIENT,
        );
        expect((error as HttpException).message).toBe('不能删除自己的账户');
      }

      // 验证用户服务没有被调用
      expect(userService.remove).not.toHaveBeenCalled();
    });

    it('用户不存在时应该传递用户服务的错误', async () => {
      // 安排
      const currentUserId = '507f1f77bcf86cd799439013';
      const userIdDto: UserIdBodyDto = {
        id: '507f1f77bcf86cd799439011',
      };

      const expectedError = new HttpException(
        '用户不存在',
        ERROR_CODES.USER_NOT_FOUND,
      );
      userService.remove.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.remove(userIdDto, currentUserId)).rejects.toThrow(
        expectedError,
      );
    });

    it('删除操作出错时应该传递用户服务的错误', async () => {
      // 安排
      const currentUserId = '507f1f77bcf86cd799439013';
      const userIdDto: UserIdBodyDto = {
        id: '507f1f77bcf86cd799439011',
      };

      const expectedError = new HttpException('数据库操作失败', 500);
      userService.remove.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.remove(userIdDto, currentUserId)).rejects.toThrow(
        expectedError,
      );
    });
  });
});
