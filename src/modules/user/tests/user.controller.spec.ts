import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { BatchOperationDto } from '../dto/batch-operation.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateStatus: jest.fn(),
    resetPassword: jest.fn(),
    batchDelete: jest.fn(),
    getUserMenus: jest.fn(),
  };

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    realName: 'Test User',
    role: 'admin',
    status: 'active',
    permissions: ['user:read', 'user:write'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        realName: 'New User',
        role: 'admin',
      };

      mockUserService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.username).toBe(mockUser.username);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const queryDto: QueryUserDto = {
        page: 1,
        limit: 10,
      };

      const mockResponse = {
        data: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockUserService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto);

      expect(result).toBeDefined();
      expect(result.data).toEqual([mockUser]);
      expect(result.total).toBe(1);
      expect(mockUserService.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = '507f1f77bcf86cd799439011';

      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(userId);

      expect(result).toBeDefined();
      expect(result.username).toBe(mockUser.username);
      expect(mockUserService.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        realName: 'Updated Name',
        email: 'updated@example.com',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(result).toBeDefined();
      expect(result.realName).toBe(updateUserDto.realName);
      expect(mockUserService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';

      mockUserService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(userId);

      expect(result).toBeDefined();
      expect(result.message).toBe('用户删除成功');
      expect(mockUserService.remove).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateStatus', () => {
    it('should update user status successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateStatusDto: UpdateUserStatusDto = {
        status: 'inactive',
      };

      const updatedUser = { ...mockUser, status: 'inactive' };
      mockUserService.updateStatus.mockResolvedValue(updatedUser);

      const result = await controller.updateStatus(userId, updateStatusDto);

      expect(result).toBeDefined();
      expect(result.status).toBe('inactive');
      expect(mockUserService.updateStatus).toHaveBeenCalledWith(
        userId,
        updateStatusDto,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset user password successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const resetPasswordDto: ResetPasswordDto = {
        newPassword: 'newpassword123',
      };

      const mockResponse = { message: '密码重置成功' };
      mockUserService.resetPassword.mockResolvedValue(mockResponse);

      const result = await controller.resetPassword(userId, resetPasswordDto);

      expect(result).toBeDefined();
      expect(result.message).toBe('密码重置成功');
      expect(mockUserService.resetPassword).toHaveBeenCalledWith(
        userId,
        resetPasswordDto,
      );
    });
  });

  describe('batchDelete', () => {
    it('should delete multiple users successfully', async () => {
      const batchOperationDto: BatchOperationDto = {
        ids: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };

      const mockResponse = { deletedCount: 2 };
      mockUserService.batchDelete.mockResolvedValue(mockResponse);

      const result = await controller.batchDelete(batchOperationDto);

      expect(result).toBeDefined();
      expect(result.deletedCount).toBe(2);
      expect(mockUserService.batchDelete).toHaveBeenCalledWith(
        batchOperationDto.ids,
      );
    });
  });

  describe('getUserMenus', () => {
    it('should return user menus successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const mockMenus = {
        menus: [
          {
            id: '1',
            title: 'Dashboard',
            path: '/dashboard',
            children: [],
          },
        ],
        permissions: ['user:read', 'user:write'],
      };

      mockUserService.getUserMenus.mockResolvedValue(mockMenus);

      const result = await controller.getUserMenus(userId);

      expect(result).toBeDefined();
      expect(result.menus).toEqual(mockMenus.menus);
      expect(result.permissions).toEqual(mockMenus.permissions);
      expect(mockUserService.getUserMenus).toHaveBeenCalledWith(userId);
    });
  });
});
