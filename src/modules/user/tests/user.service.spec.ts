import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserService } from '../services/user.service';
import { User, UserDocument } from '../entities/user.entity';
import { RoleService } from '../../role/services/role.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';

describe('UserService', () => {
  let service: UserService;
  let userModel: any;
  let roleService: RoleService;

  const mockRole = {
    _id: '507f1f77bcf86cd799439012',
    name: 'admin',
    description: '管理员',
    permissions: [
      {
        _id: '507f1f77bcf86cd799439013',
        name: 'user:read',
        description: '查看用户',
      },
    ],
  };

  const mockUserData = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    roles: [mockRole],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    ...mockUserData,
    toObject: jest.fn().mockReturnValue(mockUserData),
  };

  const mockRoleService = {
    findByIds: jest.fn(),
  };

  // Create a mock constructor function that also has static methods
  const createMockUserModel = () => {
    const MockConstructor = jest.fn().mockImplementation((userData) => ({
      ...userData,
      save: jest.fn().mockResolvedValue({
        ...mockUserData,
        ...userData,
        toObject: jest.fn().mockReturnValue({
          ...mockUserData,
          ...userData,
        }),
      }),
      toObject: jest.fn().mockReturnValue({
        ...mockUserData,
        ...userData,
      }),
    }));

    // Add static methods to the constructor
    Object.assign(MockConstructor, {
      findOne: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({ exec: jest.fn() }),
        exec: jest.fn(),
      }),
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({ exec: jest.fn() }),
          exec: jest.fn(),
        }),
        populate: jest.fn().mockReturnValue({ exec: jest.fn() }),
        exec: jest.fn(),
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({ exec: jest.fn() }),
          exec: jest.fn(),
        }),
        populate: jest.fn().mockReturnValue({ exec: jest.fn() }),
        exec: jest.fn(),
      }),
      find: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn(),
      }),
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn() }),
    });

    return MockConstructor;
  };

  beforeEach(async () => {
    const mockUserModelInstance = createMockUserModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModelInstance,
        },
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
      ],
    }).compile();

    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    roleService = module.get<RoleService>(RoleService);
    service = module.get<UserService>(UserService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should find user by username with populated roles', async () => {
      const mockExec = jest.fn().mockResolvedValue(mockUser);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      userModel.findOne.mockReturnValue({ populate: mockPopulate });

      const result = await service.findOne('testuser');

      expect(userModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(mockPopulate).toHaveBeenCalledWith('roles');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should find user by id with populated roles', async () => {
      const mockExec = jest.fn().mockResolvedValue(mockUser);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      userModel.findById.mockReturnValue({ select: mockSelect });

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(userModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(mockSelect).toHaveBeenCalledWith('-password');
      expect(mockPopulate).toHaveBeenCalledWith('roles');
      expect(result).toMatchObject({
        id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        role: 'admin', // 兼容字段
        status: 'active',
      });
    });

    it('should return null when user not found', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      userModel.findById.mockReturnValue({ select: mockSelect });

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(result).toBeNull();
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login time and IP', async () => {
      const mockExec = jest.fn().mockResolvedValue(mockUser);
      userModel.findByIdAndUpdate.mockReturnValue({ exec: mockExec });

      await service.updateLastLogin('507f1f77bcf86cd799439011', '192.168.1.1');

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({
          lastLoginTime: expect.any(Date),
          lastLoginIp: '192.168.1.1',
        }),
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateData = {
        avatar: 'new-avatar.jpg',
      };

      const mockExec = jest.fn().mockResolvedValue(mockUser);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      userModel.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      const result = await service.updateProfile(
        '507f1f77bcf86cd799439011',
        updateData,
      );

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateData,
        { new: true },
      );
      expect(result).toBeDefined();
    });

    it('should throw error when user not found', async () => {
      const updateData = {
        avatar: 'new-avatar.jpg',
      };

      const mockExec = jest.fn().mockResolvedValue(null);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      userModel.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      await expect(
        service.updateProfile('507f1f77bcf86cd799439011', updateData),
      ).rejects.toThrow('用户不存在');
    });
  });

  describe('findAll', () => {
    it('should return paginated user list with populated roles', async () => {
      const queryDto: QueryUserDto = { page: 1, limit: 10 };
      const mockUsers = [mockUser];

      const mockExec = jest.fn().mockResolvedValue(mockUsers);
      const mockCountExec = jest.fn().mockResolvedValue(1);

      userModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: mockExec,
      });

      userModel.countDocuments.mockReturnValue({ exec: mockCountExec });

      const result = await service.findAll(queryDto);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        role: 'admin',
        status: 'active',
      });
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('create', () => {
    it('should create user successfully with roles', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
        roles: ['507f1f77bcf86cd799439012'],
      };

      // Mock that user doesn't exist
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock role validation
      mockRoleService.findByIds.mockResolvedValue([mockRole]);

      // Mock user creation and retrieval
      const mockExec = jest.fn().mockResolvedValue(mockUser);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      userModel.findById.mockReturnValue({ select: mockSelect });

      const result = await service.create(createUserDto);

      expect(userModel).toHaveBeenCalledWith(createUserDto);
      expect(mockRoleService.findByIds).toHaveBeenCalledWith(
        createUserDto.roles,
      );
      expect(result).toBeDefined();
    });

    it('should throw conflict error for existing username', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        password: 'password123',
        roles: ['507f1f77bcf86cd799439012'],
      };

      // Mock that username exists
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw error for non-existent roles', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
        roles: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439999'],
      };

      // Mock that user doesn't exist
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock role validation - only return one role
      mockRoleService.findByIds.mockResolvedValue([mockRole]);

      await expect(service.create(createUserDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('update', () => {
    it('should update user successfully with role validation', async () => {
      const updateUserDto: UpdateUserDto = {
        roles: ['507f1f77bcf86cd799439012'],
      };

      // Mock user exists
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      // Mock role validation
      mockRoleService.findByIds.mockResolvedValue([mockRole]);

      const mockExec = jest.fn().mockResolvedValue(mockUser);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      userModel.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      const result = await service.update(
        '507f1f77bcf86cd799439011',
        updateUserDto,
      );

      expect(mockRoleService.findByIds).toHaveBeenCalledWith(
        updateUserDto.roles,
      );
      expect(result).toBeDefined();
    });

    it('should throw not found error for non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        roles: ['507f1f77bcf86cd799439012'],
      };

      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('507f1f77bcf86cd799439011', updateUserDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has permission through roles', async () => {
      const mockExec = jest.fn().mockResolvedValue(mockUser);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      userModel.findById.mockReturnValue({ populate: mockPopulate });

      const result = await service.hasPermission(
        '507f1f77bcf86cd799439011',
        'user:read',
      );

      expect(result).toBe(true);
    });

    it('should return false when user does not have permission', async () => {
      const mockExec = jest.fn().mockResolvedValue(mockUser);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      userModel.findById.mockReturnValue({ populate: mockPopulate });

      const result = await service.hasPermission(
        '507f1f77bcf86cd799439011',
        'user:write',
      );

      expect(result).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has role', async () => {
      const mockExec = jest.fn().mockResolvedValue(mockUser);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      userModel.findById.mockReturnValue({ populate: mockPopulate });

      const result = await service.hasRole('507f1f77bcf86cd799439011', [
        'admin',
      ]);

      expect(result).toBe(true);
    });

    it('should return false when user does not have role', async () => {
      const mockExec = jest.fn().mockResolvedValue(mockUser);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      userModel.findById.mockReturnValue({ populate: mockPopulate });

      const result = await service.hasRole('507f1f77bcf86cd799439011', [
        'super_admin',
      ]);

      expect(result).toBe(false);
    });
  });

  describe('getUserPermissions', () => {
    it('should return all permissions from user roles', async () => {
      const result = await service.getUserPermissions(mockUser as any);

      expect(result).toContain('user:read');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getUserMenus', () => {
    it('should return user menus based on permissions', async () => {
      const mockExec = jest.fn().mockResolvedValue(mockUser);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      userModel.findById.mockReturnValue({ populate: mockPopulate });

      const result = await service.getUserMenus('507f1f77bcf86cd799439011');

      expect(result).toBeDefined();
      expect(result.permissions).toBeDefined();
      expect(result.menus).toBeDefined();
      expect(Array.isArray(result.permissions)).toBe(true);
      expect(Array.isArray(result.menus)).toBe(true);
    });

    it('should throw not found error when user does not exist', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      userModel.findById.mockReturnValue({ populate: mockPopulate });

      await expect(
        service.getUserMenus('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(HttpException);
    });
  });
});
