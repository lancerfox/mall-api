import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../../user/services/user.service';
import { OperationLogService } from '../../log/services/operation-log.service';
import { SecurityService } from './security.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let operationLogService: jest.Mocked<OperationLogService>;
  let securityService: jest.Mocked<SecurityService>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    password: 'hashedpassword',
    email: 'test@example.com',
    realName: '测试用户',
    role: 'admin',
    status: 'active',
    permissions: ['user:read'],
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      username: 'testuser',
      password: 'hashedpassword',
      email: 'test@example.com',
      realName: '测试用户',
      role: 'admin',
      status: 'active',
      permissions: ['user:read'],
    }),
  };

  const mockUserWithoutPassword = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    realName: '测试用户',
    role: 'admin',
    status: 'active',
    permissions: ['user:read'],
  };

  beforeEach(async () => {
    const mockUserService = {
      findOne: jest.fn(),
      findById: jest.fn(),
      updateLastLogin: jest.fn(),
      updateProfile: jest.fn(),
      updatePassword: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockOperationLogService = {
      logLogin: jest.fn(),
      logProfileUpdate: jest.fn(),
      logPasswordChange: jest.fn(),
    };

    const mockSecurityService = {
      isAccountLocked: jest.fn(),
      getRemainingLockTime: jest.fn(),
      recordLoginAttempt: jest.fn(),
      validatePasswordStrength: jest.fn(),
      getLoginAttemptStats: jest.fn(),
      unlockAccount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: OperationLogService, useValue: mockOperationLogService },
        { provide: SecurityService, useValue: mockSecurityService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    operationLogService = module.get(OperationLogService);
    securityService = module.get(SecurityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    beforeEach(() => {
      securityService.isAccountLocked.mockReturnValue(false);
      securityService.recordLoginAttempt.mockImplementation();
    });

    it('should validate user successfully', async () => {
      userService.findOne.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('testuser', 'password', '127.0.0.1', 'test-agent');

      expect(userService.findOne).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
      expect(securityService.recordLoginAttempt).toHaveBeenCalledWith('testuser', '127.0.0.1', true, 'test-agent');
      expect(result).toEqual(mockUserWithoutPassword);
    });

    it('should return null for invalid password', async () => {
      userService.findOne.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('testuser', 'wrongpassword', '127.0.0.1', 'test-agent');

      expect(securityService.recordLoginAttempt).toHaveBeenCalledWith('testuser', '127.0.0.1', false, 'test-agent');
      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      userService.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'password', '127.0.0.1', 'test-agent');

      expect(securityService.recordLoginAttempt).toHaveBeenCalledWith('nonexistent', '127.0.0.1', false, 'test-agent');
      expect(result).toBeNull();
    });

    it('should throw UnauthorizedException for locked account', async () => {
      securityService.isAccountLocked.mockReturnValue(true);
      securityService.getRemainingLockTime.mockReturnValue(15);

      await expect(
        service.validateUser('testuser', 'password', '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for locked user status', async () => {
      const lockedUser = { ...mockUser, status: 'locked' };
      userService.findOne.mockResolvedValue(lockedUser as any);

      await expect(
        service.validateUser('testuser', 'password', '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user status', async () => {
      const inactiveUser = { ...mockUser, status: 'inactive' };
      userService.findOne.mockResolvedValue(inactiveUser as any);

      await expect(
        service.validateUser('testuser', 'password', '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockToken = 'mock-jwt-token';
      userService.updateLastLogin.mockResolvedValue();
      userService.findById.mockResolvedValue(mockUserWithoutPassword as any);
      jwtService.sign.mockReturnValue(mockToken);
      configService.get.mockImplementation((key: string) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        if (key === 'JWT_EXPIRES_IN') return '1h';
        return undefined;
      });
      operationLogService.logLogin.mockResolvedValue({} as any);

      const result = await service.login(mockUserWithoutPassword as any, '127.0.0.1', 'test-agent');

      expect(userService.updateLastLogin).toHaveBeenCalledWith('507f1f77bcf86cd799439011', '127.0.0.1');
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          username: 'testuser',
          sub: '507f1f77bcf86cd799439011',
          role: 'admin',
        },
        {
          secret: 'test-secret',
          expiresIn: '1h',
        },
      );
      expect(operationLogService.logLogin).toHaveBeenCalled();
      expect(result).toEqual({
        access_token: mockToken,
        user: expect.objectContaining({
          id: '507f1f77bcf86cd799439011',
          username: 'testuser',
        }),
        expires_in: 3600,
      });
    });

    it('should throw UnauthorizedException if user not found after login', async () => {
      userService.updateLastLogin.mockResolvedValue();
      userService.findById.mockResolvedValue(null);
      jwtService.sign.mockReturnValue('mock-token');
      configService.get.mockReturnValue('test-secret');

      await expect(
        service.login(mockUserWithoutPassword as any, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      const mockPayload = { sub: '507f1f77bcf86cd799439011', username: 'testuser', role: 'admin' };
      jwtService.verify.mockReturnValue(mockPayload);
      configService.get.mockReturnValue('test-secret');

      const result = await service.validateToken('valid-token');

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token', { secret: 'test-secret' });
      expect(result).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      configService.get.mockReturnValue('test-secret');

      await expect(service.validateToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      userService.findById.mockResolvedValue(mockUserWithoutPassword as any);

      const result = await service.getProfile('507f1f77bcf86cd799439011');

      expect(userService.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(expect.objectContaining({
        id: '507f1f77bcf86cd799439011',
        username: 'testuser',
      }));
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userService.findById.mockResolvedValue(null);

      await expect(service.getProfile('507f1f77bcf86cd799439011')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateProfile', () => {
    const updateData = {
      email: 'newemail@example.com',
      realName: '新用户名',
      phone: '13800138000',
      avatar: 'https://example.com/avatar.jpg',
    };

    it('should update profile successfully', async () => {
      const updatedUser = { ...mockUserWithoutPassword, ...updateData };
      userService.findById.mockResolvedValue(mockUserWithoutPassword as any);
      userService.updateProfile.mockResolvedValue(updatedUser as any);
      operationLogService.logProfileUpdate.mockResolvedValue({} as any);

      const result = await service.updateProfile('507f1f77bcf86cd799439011', updateData, '127.0.0.1', 'test-agent');

      expect(userService.updateProfile).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateData);
      expect(operationLogService.logProfileUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'testuser',
        '127.0.0.1',
        'test-agent',
        'success',
      );
      expect(result).toEqual(expect.objectContaining(updateData));
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userService.findById.mockResolvedValue(null);

      await expect(
        service.updateProfile('507f1f77bcf86cd799439011', updateData, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      userService.findById.mockResolvedValue(mockUserWithoutPassword as any);
      userService.findOne.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      securityService.validatePasswordStrength.mockReturnValue({
        isValid: true,
        errors: [],
        score: 85,
      });
      userService.updatePassword.mockResolvedValue();
      operationLogService.logPasswordChange.mockResolvedValue({} as any);

      await service.changePassword('507f1f77bcf86cd799439011', 'oldpassword', 'newpassword', '127.0.0.1', 'test-agent');

      expect(securityService.validatePasswordStrength).toHaveBeenCalledWith('newpassword');
      expect(bcrypt.compare).toHaveBeenCalledWith('oldpassword', 'hashedpassword');
      expect(userService.updatePassword).toHaveBeenCalledWith('507f1f77bcf86cd799439011', 'newpassword');
      expect(operationLogService.logPasswordChange).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'testuser',
        '127.0.0.1',
        'test-agent',
        'success',
      );
    });

    it('should throw BadRequestException for weak password', async () => {
      userService.findById.mockResolvedValue(mockUserWithoutPassword as any);
      securityService.validatePasswordStrength.mockReturnValue({
        isValid: false,
        errors: ['密码太弱'],
        score: 30,
      });

      await expect(
        service.changePassword('507f1f77bcf86cd799439011', 'oldpassword', 'weak', '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException for incorrect current password', async () => {
      userService.findById.mockResolvedValue(mockUserWithoutPassword as any);
      userService.findOne.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      securityService.validatePasswordStrength.mockReturnValue({
        isValid: true,
        errors: [],
        score: 85,
      });

      await expect(
        service.changePassword('507f1f77bcf86cd799439011', 'wrongpassword', 'newpassword', '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException for same password', async () => {
      userService.findById.mockResolvedValue(mockUserWithoutPassword as any);
      userService.findOne.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      securityService.validatePasswordStrength.mockReturnValue({
        isValid: true,
        errors: [],
        score: 85,
      });

      await expect(
        service.changePassword('507f1f77bcf86cd799439011', 'samepassword', 'samepassword', '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate password strength', () => {
      const mockValidation = { isValid: true, errors: [], score: 85 };
      securityService.validatePasswordStrength.mockReturnValue(mockValidation);

      const result = service.validatePasswordStrength('StrongPass123!');

      expect(securityService.validatePasswordStrength).toHaveBeenCalledWith('StrongPass123!');
      expect(result).toEqual(mockValidation);
    });
  });

  describe('getSecurityStats', () => {
    it('should return security statistics', () => {
      const mockStats = {
        totalAttempts: 10,
        successfulAttempts: 8,
        failedAttempts: 2,
        lockedAccounts: 0,
      };
      securityService.getLoginAttemptStats.mockReturnValue(mockStats);

      const result = service.getSecurityStats('testuser');

      expect(securityService.getLoginAttemptStats).toHaveBeenCalledWith('testuser');
      expect(result).toEqual(mockStats);
    });
  });

  describe('unlockAccount', () => {
    it('should unlock account', () => {
      securityService.unlockAccount.mockImplementation();

      service.unlockAccount('testuser', '127.0.0.1');

      expect(securityService.unlockAccount).toHaveBeenCalledWith('testuser', '127.0.0.1');
    });
  });
});