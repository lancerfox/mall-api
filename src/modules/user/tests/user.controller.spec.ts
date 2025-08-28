import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { UserIdQueryDto } from '../dto/user-id-query.dto';
import { UserIdBodyDto } from '../dto/user-id-body.dto';
import { UpdateUserWithIdDto } from '../dto/update-user-with-id.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
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
      const query: UserIdQueryDto = { id: '507f1f77bcf86cd799439011' };

      const result = await controller.findOne(query);

      expect(userService.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw HttpException when user not found', async () => {
      userService.findById.mockResolvedValue(null);
      const query: UserIdQueryDto = { id: '507f1f77bcf86cd799439011' };

      await expect(controller.findOne(query)).rejects.toThrow(
        new HttpException('用户不存在', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'Password123!',
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
      const updateUserWithIdDto: UpdateUserWithIdDto = {
        id: '507f1f77bcf86cd799439011',
        role: 'operator',
      };
      const updatedUser = { ...mockUser, role: 'operator' };
      userService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(
        updateUserWithIdDto,
        'different-user-id',
      );

      expect(userService.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { role: 'operator' },
      );
      expect(result).toEqual(updatedUser);
    });

    it('should prevent user from updating own role and status', async () => {
      const updateUserWithIdDto: UpdateUserWithIdDto = {
        id: '507f1f77bcf86cd799439011',
        role: 'super_admin',
        status: 'inactive',
      };
      userService.update.mockResolvedValue(mockUser);

      await controller.update(updateUserWithIdDto, '507f1f77bcf86cd799439011');

      expect(userService.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {},
      );
    });
  });

  describe('remove', () => {
    it('should delete user successfully', async () => {
      userService.remove.mockResolvedValue();
      const userIdDto: UserIdBodyDto = { id: '507f1f77bcf86cd799439011' };

      const result = await controller.remove(userIdDto, 'different-user-id');

      expect(userService.remove).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual({ message: '删除用户成功' });
    });

    it('should prevent user from deleting themselves', async () => {
      const userIdDto: UserIdBodyDto = { id: '507f1f77bcf86cd799439011' };

      await expect(
        controller.remove(userIdDto, '507f1f77bcf86cd799439011'),
      ).rejects.toThrow(
        new HttpException('不能删除自己的账户', HttpStatus.BAD_REQUEST),
      );
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
      const query: UserIdQueryDto = { id: '507f1f77bcf86cd799439011' };
      userService.getUserMenus.mockResolvedValue(menuResult);

      const result = await controller.getUserMenus(query);

      expect(userService.getUserMenus).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(menuResult);
    });
  });
});
