import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserService } from '../services/user.service';
import { User, UserDocument } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let userModel: any;

  const mockUserData = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    role: 'admin',
    status: 'active',
    permissions: ['user:read'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    ...mockUserData,
    toObject: jest.fn().mockReturnValue(mockUserData),
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
      findOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({ exec: jest.fn() }),
        exec: jest.fn(),
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({ exec: jest.fn() }),
        exec: jest.fn(),
      }),
      find: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn(),
      }),
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn() }),
      aggregate: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
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
      ],
    }).compile();

    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    service = module.get<UserService>(UserService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should find user by username', async () => {
      const mockExec = jest.fn().mockResolvedValue(mockUser);
      userModel.findOne.mockReturnValue({ exec: mockExec } as any);

      const result = await service.findOne('testuser');

      expect(userModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const mockSelect = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });
      userModel.findById.mockReturnValue({ select: mockSelect } as any);

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(userModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toMatchObject({
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        role: 'admin',
        status: 'active',
        permissions: ['user:read'],
      });
    });

    it('should return null when user not found', async () => {
      const mockSelect = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      userModel.findById.mockReturnValue({ select: mockSelect } as any);

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(result).toBeNull();
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login time and IP', async () => {
      const mockExec = jest.fn().mockResolvedValue(mockUser);
      userModel.findByIdAndUpdate.mockReturnValue({ exec: mockExec } as any);

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

      const mockSelect = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });
      userModel.findByIdAndUpdate.mockReturnValue({
        select: mockSelect,
      } as any);

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

      const mockSelect = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      userModel.findByIdAndUpdate.mockReturnValue({
        select: mockSelect,
      } as any);

      await expect(
        service.updateProfile('507f1f77bcf86cd799439011', updateData),
      ).rejects.toThrow('用户不存在');
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const mockExec = jest.fn().mockResolvedValue(mockUser);
      userModel.findByIdAndUpdate.mockReturnValue({ exec: mockExec } as any);

      await service.updatePassword('507f1f77bcf86cd799439011', 'newpassword');

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { password: 'newpassword' },
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated user list', async () => {
      const queryDto: QueryUserDto = { page: 1, limit: 10 };
      const mockUsers = [mockUser];

      const mockExec = jest.fn().mockResolvedValue(mockUsers);
      const mockCountExec = jest.fn().mockResolvedValue(1);

      userModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: mockExec,
      } as any);

      userModel.countDocuments.mockReturnValue({ exec: mockCountExec } as any);

      const result = await service.findAll(queryDto);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        role: 'admin',
        status: 'active',
        permissions: ['user:read'],
      });
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should apply filters', async () => {
      const queryDto: QueryUserDto = {
        page: 1,
        limit: 10,
        username: 'test',
        status: 'active',
      };

      const mockUsers = [mockUser];
      const mockExec = jest.fn().mockResolvedValue(mockUsers);
      const mockCountExec = jest.fn().mockResolvedValue(1);

      userModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: mockExec,
      } as any);

      userModel.countDocuments.mockReturnValue({ exec: mockCountExec } as any);

      await service.findAll(queryDto);

      expect(userModel.find).toHaveBeenCalledWith({
        username: { $regex: 'test', $options: 'i' },
        status: 'active',
      });
    });
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
        role: 'admin',
      };

      // Mock that user doesn't exist
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await service.create(createUserDto);

      expect(userModel).toHaveBeenCalledWith(createUserDto);
      expect(result).toBeDefined();
    });

    it('should throw conflict error for existing username', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        password: 'password123',
        role: 'admin',
      };

      // Mock that username exists
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      await expect(service.create(createUserDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        role: 'operator',
      };

      // Mock user exists
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const mockSelect = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });
      userModel.findByIdAndUpdate.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await service.update(
        '507f1f77bcf86cd799439011',
        updateUserDto,
      );

      expect(result).toBeDefined();
    });

    it('should throw not found error for non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        role: 'operator',
      };

      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        service.update('507f1f77bcf86cd799439011', updateUserDto),
      ).rejects.toThrow(HttpException);
    });

    it('should hash password when updating', async () => {
      const updateUserDto: UpdateUserDto = {
        password: 'newpassword',
      };

      // Mock user exists
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      // Mock bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      const mockSelect = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });
      userModel.findByIdAndUpdate.mockReturnValue({
        select: mockSelect,
      } as any);

      await service.update('507f1f77bcf86cd799439011', updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      const mockExec = jest.fn().mockResolvedValue(mockUser);
      userModel.findByIdAndDelete.mockReturnValue({ exec: mockExec } as any);

      await service.remove('507f1f77bcf86cd799439011');

      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw not found error when user does not exist', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      userModel.findByIdAndDelete.mockReturnValue({ exec: mockExec } as any);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('updatePermissions', () => {
    it('should update user permissions successfully', async () => {
      const permissions = ['user:read', 'user:write'];

      const mockSelect = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });
      userModel.findByIdAndUpdate.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await service.updatePermissions(
        '507f1f77bcf86cd799439011',
        permissions,
      );

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { permissions },
        { new: true },
      );
      expect(result).toBeDefined();
    });
  });

  describe('hasPermission', () => {
    it('should return true for super admin', async () => {
      const superAdminUser = { ...mockUser, role: 'super_admin' };
      const mockSelect = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(superAdminUser) });
      userModel.findById.mockReturnValue({ select: mockSelect } as any);

      const result = await service.hasPermission(
        '507f1f77bcf86cd799439011',
        'any:permission',
      );

      expect(result).toBe(true);
    });

    it('should return true when user has permission', async () => {
      const userWithPermission = { ...mockUser, permissions: ['user:read'] };
      const mockSelect = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithPermission),
      });
      userModel.findById.mockReturnValue({ select: mockSelect } as any);

      const result = await service.hasPermission(
        '507f1f77bcf86cd799439011',
        'user:read',
      );

      expect(result).toBe(true);
    });

    it('should return false when user does not have permission', async () => {
      const userWithoutPermission = { ...mockUser, permissions: ['user:read'] };
      const mockSelect = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithoutPermission),
      });
      userModel.findById.mockReturnValue({ select: mockSelect } as any);

      const result = await service.hasPermission(
        '507f1f77bcf86cd799439011',
        'user:write',
      );

      expect(result).toBe(false);
    });
  });

  describe('getUserMenus', () => {
    it('should return user menus', async () => {
      const mockSelect = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });
      userModel.findById.mockReturnValue({ select: mockSelect } as any);

      // Mock getUserPermissions method
      jest
        .spyOn(service, 'getUserPermissions')
        .mockResolvedValue(['user:read', 'user:write']);

      const result = await service.getUserMenus('507f1f77bcf86cd799439011');

      expect(result).toBeDefined();
      expect(result.permissions).toBeDefined();
      expect(result.menus).toBeDefined();
      expect(Array.isArray(result.permissions)).toBe(true);
      expect(Array.isArray(result.menus)).toBe(true);
    });

    it('should throw not found error when user does not exist', async () => {
      const mockSelect = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      userModel.findById.mockReturnValue({ select: mockSelect } as any);

      await expect(
        service.getUserMenus('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(HttpException);
    });
  });
});
