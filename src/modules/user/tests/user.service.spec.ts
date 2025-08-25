import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User, UserDocument } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SecurityService } from '../../auth/services/security.service';

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<UserDocument>;
  let securityService: SecurityService;

  const mockUser = {
    _id: new Types.ObjectId(),
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    realName: 'Test User',
    role: 'admin',
    status: 'active',
    permissions: ['user:read', 'user:write'],
    phone: '1234567890',
    avatar: 'avatar.jpg',
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: () => mockUser,
    save: jest.fn(),
  };

  const mockUserModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    aggregate: jest.fn(),
  };

  const mockSecurityService = {
    hashPassword: jest.fn(),
    generateRandomPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: SecurityService,
          useValue: mockSecurityService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    securityService = module.get<SecurityService>(SecurityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      mockUserModel.findOne.mockResolvedValue(null);
      mockSecurityService.hashPassword.mockResolvedValue('hashedPassword');
      const mockCreatedUser = {
        ...mockUser,
        ...createUserDto,
        save: jest.fn().mockResolvedValue(mockUser),
      };
      jest
        .spyOn(userModel, 'constructor' as any)
        .mockReturnValue(mockCreatedUser);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.username).toBe(createUserDto.username);
      expect(mockSecurityService.hashPassword).toHaveBeenCalledWith(
        createUserDto.password,
      );
    });

    it('should throw BadRequestException if username already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password123',
        realName: 'New User',
        role: 'admin',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
        realName: 'New User',
        role: 'admin',
      };

      mockUserModel.findOne
        .mockResolvedValueOnce(null) // username check
        .mockResolvedValueOnce(mockUser); // email check

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const queryDto: QueryUserDto = {
        page: 1,
        limit: 10,
      };

      const mockUsers = [mockUser];
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUsers),
              }),
            }),
          }),
        }),
      });
      mockUserModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll(queryDto);

      expect(result).toBeDefined();
      expect(result.data).toEqual(mockUsers);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter users by search criteria', async () => {
      const queryDto: QueryUserDto = {
        page: 1,
        limit: 10,
        username: 'test',
        role: 'admin',
        status: 'active',
      };

      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([mockUser]),
              }),
            }),
          }),
        }),
      });
      mockUserModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll(queryDto);

      expect(result).toBeDefined();
      expect(mockUserModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          username: { $regex: 'test', $options: 'i' },
          role: 'admin',
          status: 'active',
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = new Types.ObjectId().toString();
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      const result = await service.findOne(userId);

      expect(result).toBeDefined();
      expect(result.username).toBe(mockUser.username);
    });

    it('should throw BadRequestException for invalid id', async () => {
      const invalidId = 'invalid-id';

      await expect(service.findOne(invalidId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = new Types.ObjectId().toString();
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const userId = new Types.ObjectId().toString();
      const updateUserDto: UpdateUserDto = {
        realName: 'Updated Name',
        email: 'updated@example.com',
      };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserModel.findOne.mockResolvedValue(null);
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedUser),
        }),
      });

      const result = await service.update(userId, updateUserDto);

      expect(result).toBeDefined();
      expect(result.realName).toBe(updateUserDto.realName);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = new Types.ObjectId().toString();
      const updateUserDto: UpdateUserDto = {
        realName: 'Updated Name',
      };

      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      const userId = new Types.ObjectId().toString();

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUser);

      await expect(service.remove(userId)).resolves.not.toThrow();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = new Types.ObjectId().toString();

      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update user status successfully', async () => {
      const userId = new Types.ObjectId().toString();
      const updateStatusDto: UpdateUserStatusDto = {
        status: 'inactive',
      };

      mockUserModel.findById.mockResolvedValue(mockUser);
      const updatedUser = { ...mockUser, status: 'inactive' };
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedUser),
        }),
      });

      const result = await service.updateStatus(userId, updateStatusDto);

      expect(result).toBeDefined();
      expect(result.status).toBe('inactive');
    });
  });

  describe('resetPassword', () => {
    it('should reset user password successfully', async () => {
      const userId = new Types.ObjectId().toString();
      const resetPasswordDto: ResetPasswordDto = {
        newPassword: 'newpassword123',
      };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockSecurityService.hashPassword.mockResolvedValue('hashedNewPassword');
      mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUser);

      const result = await service.resetPassword(userId, resetPasswordDto);

      expect(result).toBeDefined();
      expect(result.message).toBe('密码重置成功');
      expect(mockSecurityService.hashPassword).toHaveBeenCalledWith(
        resetPasswordDto.newPassword,
      );
    });
  });

  describe('batchDelete', () => {
    it('should delete multiple users successfully', async () => {
      const userIds = [
        new Types.ObjectId().toString(),
        new Types.ObjectId().toString(),
      ];

      mockUserModel.deleteMany.mockResolvedValue({ deletedCount: 2 });

      const result = await service.batchDelete(userIds);

      expect(result).toBeDefined();
      expect(result.deletedCount).toBe(2);
    });
  });

  describe('getUserMenus', () => {
    it('should return user menus based on permissions', async () => {
      const userId = new Types.ObjectId().toString();

      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      const result = await service.getUserMenus(userId);

      expect(result).toBeDefined();
      expect(result.permissions).toEqual(mockUser.permissions);
    });
  });
});
