import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserWithIdDto } from '../dto/update-user-with-id.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { UserIdBodyDto } from '../dto/user-id-body.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserListResponseDto } from '../dto/user-list-response.dto';

describe('UserController', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;

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

    userController = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  describe('findAll', () => {
    it('应该成功获取用户列表', async () => {
      // 安排
      const queryUserDto: QueryUserDto = {
        page: 1,
        pageSize: 10,
        username: 'test',
      };
      const userListResponse: UserListResponseDto = {
        data: [
          {
            id: '1',
            username: 'testuser1',
            status: 'active',
            roles: [],
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isSuperAdmin: false,
          },
          {
            id: '2',
            username: 'testuser2',
            status: 'active',
            roles: [],
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isSuperAdmin: false,
          },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      userService.findAll.mockResolvedValue(userListResponse);

      // 执行
      const result = await userController.findAll(queryUserDto);

      // 断言
      expect(result).toEqual(userListResponse);
      expect(userService.findAll).toHaveBeenCalledWith(queryUserDto);
    });
  });

  describe('create', () => {
    it('应该成功创建新用户', async () => {
      // 安排
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
        roles: ['role123'],
      };
      const userResponse: UserResponseDto = {
        id: 'user123',
        username: 'newuser',
        status: 'active',
        roles: [],
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isSuperAdmin: false,
      };

      userService.create.mockResolvedValue(userResponse);

      // 执行
      const result = await userController.create(createUserDto);

      // 断言
      expect(result).toEqual(userResponse);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('update', () => {
    it('应该成功更新用户信息', async () => {
      // 安排
      const updateUserDto: UpdateUserWithIdDto = {
        id: 'user123',
        status: 'inactive',
        roles: ['role456'],
      };
      const currentUserId = 'admin123'; // 不同的用户ID
      const userResponse: UserResponseDto = {
        id: 'user123',
        username: 'testuser',
        status: 'inactive',
        roles: [],
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isSuperAdmin: false,
      };

      userService.update.mockResolvedValue(userResponse);

      // 执行
      const result = await userController.update(updateUserDto, currentUserId);

      // 断言
      expect(result).toEqual(userResponse);
      expect(userService.update).toHaveBeenCalledWith('user123', {
        status: 'inactive',
        roles: ['role456'],
      });
    });

    it('应该防止用户修改自己的角色和状态', async () => {
      // 安排
      const updateUserDto: UpdateUserWithIdDto = {
        id: 'user123',
        status: 'inactive',
        roles: ['role456'],
      };
      const currentUserId = 'user123'; // 与要更新的用户ID相同
      const userResponse: UserResponseDto = {
        id: 'user123',
        username: 'testuser',
        status: 'active', // 保持原状态
        roles: [], // 保持原角色
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isSuperAdmin: false,
      };

      userService.update.mockResolvedValue(userResponse);

      // 执行
      const result = await userController.update(updateUserDto, currentUserId);

      // 断言
      expect(result).toEqual(userResponse);
      expect(userService.update).toHaveBeenCalledWith('user123', {});
    });
  });

  describe('remove', () => {
    it('应该成功删除用户', async () => {
      // 安排
      const userIdDto: UserIdBodyDto = { id: 'user123' };
      const currentUserId = 'admin123'; // 不同的用户ID

      userService.remove.mockResolvedValue();

      // 执行
      const result = await userController.remove(userIdDto, currentUserId);

      // 断言
      expect(result).toEqual({ message: '删除用户成功' });
      expect(userService.remove).toHaveBeenCalledWith('user123');
    });

    it('应该防止用户删除自己', async () => {
      // 安排
      const userIdDto: UserIdBodyDto = { id: 'user123' };
      const currentUserId = 'user123'; // 相同的用户ID

      // 执行和断言
      await expect(
        userController.remove(userIdDto, currentUserId),
      ).rejects.toThrow('不能删除自己的账户');
    });
  });
});
