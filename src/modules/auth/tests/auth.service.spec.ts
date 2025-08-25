import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../services/auth.service';
import { SecurityService } from '../services/security.service';
import { User, UserDocument } from '../../user/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userModel: Model<UserDocument>;
  let jwtService: JwtService;
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
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: () => mockUser,
    save: jest.fn(),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockSecurityService = {
    validatePassword: jest.fn(),
    hashPassword: jest.fn(),
    recordLoginAttempt: jest.fn(),
    isAccountLocked: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: SecurityService,
          useValue: mockSecurityService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
    securityService = module.get<SecurityService>(SecurityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockSecurityService.isAccountLocked.mockResolvedValue(false);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        loginDto.username,
        loginDto.password,
      );

      expect(result).toBeDefined();
      expect(result.username).toBe(mockUser.username);
      expect(mockSecurityService.recordLoginAttempt).toHaveBeenCalledWith(
        mockUser.username,
        true,
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockSecurityService.isAccountLocked.mockResolvedValue(false);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser(loginDto.username, loginDto.password),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockSecurityService.recordLoginAttempt).toHaveBeenCalledWith(
        mockUser.username,
        false,
      );
    });

    it('should throw UnauthorizedException for locked account', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockSecurityService.isAccountLocked.mockResolvedValue(true);

      await expect(
        service.validateUser('testuser', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const inactiveUser = { ...mockUser, status: 'inactive' };
      mockUserModel.findOne.mockResolvedValue(inactiveUser);
      mockSecurityService.isAccountLocked.mockResolvedValue(false);

      await expect(
        service.validateUser('testuser', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };

      const mockTokens = {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser as any);
      jest.spyOn(service, 'generateTokens').mockResolvedValue(mockTokens);
      mockUser.save.mockResolvedValue(mockUser);

      const result = await service.login(loginDto, '127.0.0.1');

      expect(result).toBeDefined();
      expect(result.access_token).toBe(mockTokens.access_token);
      expect(result.user.username).toBe(mockUser.username);
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      mockJwtService.sign
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');

      const result = await service.generateTokens(mockUser as any);

      expect(result.access_token).toBe('access_token');
      expect(result.refresh_token).toBe('refresh_token');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'valid_refresh_token';
      const payload = {
        sub: mockUser._id.toString(),
        username: mockUser.username,
      };

      mockJwtService.verify.mockReturnValue(payload);
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new_access_token');

      const result = await service.refreshToken(refreshToken);

      expect(result.access_token).toBe('new_access_token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalid_refresh_token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = mockUser._id.toString();
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      };

      mockUserModel.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockSecurityService.hashPassword.mockResolvedValue('hashedNewPassword');
      mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUser);

      await expect(
        service.changePassword(userId, changePasswordDto),
      ).resolves.not.toThrow();
    });

    it('should throw BadRequestException for incorrect current password', async () => {
      const userId = mockUser._id.toString();
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      };

      mockUserModel.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = mockUser._id.toString();
      const updateProfileDto: UpdateProfileDto = {
        realName: 'Updated Name',
        email: 'updated@example.com',
      };

      const updatedUser = { ...mockUser, ...updateProfileDto };
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(userId, updateProfileDto);

      expect(result.realName).toBe(updateProfileDto.realName);
      expect(result.email).toBe(updateProfileDto.email);
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile successfully', async () => {
      const userId = mockUser._id.toString();

      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      const result = await service.getUserProfile(userId);

      expect(result).toBeDefined();
      expect(result.username).toBe(mockUser.username);
    });
  });
});
