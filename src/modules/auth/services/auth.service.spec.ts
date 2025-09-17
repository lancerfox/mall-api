import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../../user/services/user.service';
import { SecurityService } from './security.service';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { IUserWithoutPassword } from '../types';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));
const mockedBcrypt = require('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let securityService: jest.Mocked<SecurityService>;

  // 测试用户数据
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    password: '$2b$10$hashedpassword',
    roles: [{ id: '507f1f77bcf86cd799439012', name: 'user' }],
    status: 'active',
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      id: '507f1f77bcf86cd799439011',
      username: 'testuser',
      password: '$2b$10$hashedpassword',
      roles: [{ id: '507f1f77bcf86cd799439012', name: 'user' }],
      status: 'active',
      avatar: '',
      permissions: [],
      lastLoginTime: new Date(),
      lastLoginIp: '127.0.0.1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  };

  const mockUserWithoutPassword: IUserWithoutPassword = {
    id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    roles: [{ id: '507f1f77bcf86cd799439012', name: 'user' }],
    status: 'active',
    avatar: '',
    permissions: [],
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
            updateLastLogin: jest.fn(),
            updatePassword: jest.fn(),
            generateRandomPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: SecurityService,
          useValue: {
            isAccountLocked: jest.fn(),
            getRemainingLockTime: jest.fn(),
            recordLoginAttempt: jest.fn(),
            getLoginAttemptStats: jest.fn(),
            unlockAccount: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    securityService = module.get(SecurityService);

    // 重置所有mock
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('应该成功验证用户并返回用户信息（不含密码）', async () => {
      // 安排
      const username = 'testuser';
      const password = 'plainpassword';
      const ip = '127.0.0.1';
      const userAgent = 'test-agent';

      securityService.isAccountLocked.mockReturnValue(false);
      userService.findOne.mockResolvedValue(mockUser as any);
      mockedBcrypt.compare.mockResolvedValue(true);

      // 执行
      const result = await service.validateUser(
        username,
        password,
        ip,
        userAgent,
      );

      // 断言
      expect(result).toBeDefined();
      expect(result?.username).toBe('testuser');
      expect(result?.id).toBe('507f1f77bcf86cd799439011');
      expect(result).not.toHaveProperty('password');
      expect(securityService.recordLoginAttempt).toHaveBeenCalledWith(
        username,
        ip,
        true,
        userAgent,
      );
    });

    it('用户名不存在时应该返回null', async () => {
      // 安排
      const username = 'nonexistent';
      const password = 'password';
      const ip = '127.0.0.1';
      const userAgent = 'test-agent';

      securityService.isAccountLocked.mockReturnValue(false);
      userService.findOne.mockResolvedValue(null);

      // 执行
      const result = await service.validateUser(
        username,
        password,
        ip,
        userAgent,
      );

      // 断言
      expect(result).toBeNull();
      expect(securityService.recordLoginAttempt).toHaveBeenCalledWith(
        username,
        ip,
        false,
        userAgent,
      );
    });

    it('密码错误时应该返回null', async () => {
      // 安排
      const username = 'testuser';
      const password = 'wrongpassword';
      const ip = '127.0.0.1';
      const userAgent = 'test-agent';

      securityService.isAccountLocked.mockReturnValue(false);
      userService.findOne.mockResolvedValue(mockUser as any);
      mockedBcrypt.compare.mockResolvedValue(false);

      // 执行
      const result = await service.validateUser(
        username,
        password,
        ip,
        userAgent,
      );

      // 断言
      expect(result).toBeNull();
      expect(securityService.recordLoginAttempt).toHaveBeenCalledWith(
        username,
        ip,
        false,
        userAgent,
      );
    });

    it('账户被锁定时应该抛出锁定错误', async () => {
      // 安排
      const username = 'testuser';
      const password = 'password';
      const ip = '127.0.0.1';
      const userAgent = 'test-agent';

      securityService.isAccountLocked.mockReturnValue(true);
      securityService.getRemainingLockTime.mockReturnValue(15);

      // 执行和断言
      await expect(
        service.validateUser(username, password, ip, userAgent),
      ).rejects.toThrow(HttpException);

      // 验证错误码
      try {
        await service.validateUser(username, password, ip, userAgent);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.ACCOUNT_LOCKED,
        );
      }
    });

    it('用户状态为locked时应该抛出账户锁定错误', async () => {
      // 安排
      const username = 'testuser';
      const password = 'password';
      const lockedUser = { ...mockUser, status: 'locked' };

      securityService.isAccountLocked.mockReturnValue(false);
      userService.findOne.mockResolvedValue(lockedUser as any);

      // 执行和断言
      await expect(service.validateUser(username, password)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.validateUser(username, password);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.ACCOUNT_LOCKED,
        );
      }
    });

    it('用户状态为inactive时应该抛出账户禁用错误', async () => {
      // 安排
      const username = 'testuser';
      const password = 'password';
      const inactiveUser = { ...mockUser, status: 'inactive' };

      securityService.isAccountLocked.mockReturnValue(false);
      userService.findOne.mockResolvedValue(inactiveUser as any);

      // 执行和断言
      await expect(service.validateUser(username, password)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.validateUser(username, password);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.ACCOUNT_DISABLED,
        );
      }
    });
  });

  describe('login', () => {
    it('应该成功生成访问令牌', async () => {
      // 安排
      const user = mockUserWithoutPassword;
      const ip = '127.0.0.1';
      const userAgent = 'test-agent';
      const mockAccessToken = 'mock.jwt.token';

      jwtService.sign.mockReturnValue(mockAccessToken);
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'JWT_SECRET':
            return 'test-secret';
          case 'JWT_EXPIRES_IN':
            return '1h';
          default:
            return undefined;
        }
      });

      // 执行
      const result = await service.login(user, ip, userAgent);

      // 断言
      expect(result).toEqual({
        access_token: mockAccessToken,
        expires_in: 3600, // 1小时 = 3600秒
      });
      expect(userService.updateLastLogin).toHaveBeenCalledWith(user.id, ip);
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          username: user.username,
          sub: user.id,
          role: 'user',
        },
        {
          secret: 'test-secret',
          expiresIn: '1h',
        },
      );
    });

    it('用户ID不存在时应该查找用户并获取ID', async () => {
      // 安排
      const userWithoutId = { ...mockUserWithoutPassword, id: '' };
      const foundUser = { _id: '507f1f77bcf86cd799439011' };

      userService.findOne.mockResolvedValue(foundUser as any);
      jwtService.sign.mockReturnValue('mock.jwt.token');
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'JWT_SECRET':
            return 'test-secret';
          case 'JWT_EXPIRES_IN':
            return '1h';
          default:
            return undefined;
        }
      });

      // 执行
      const result = await service.login(userWithoutId);

      // 断言
      expect(result).toBeDefined();
      expect(userService.findOne).toHaveBeenCalledWith(userWithoutId.username);
      expect(userService.updateLastLogin).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        undefined,
      );
    });

    it('用户不存在时应该抛出用户不存在错误', async () => {
      // 安排
      const userWithoutId = { ...mockUserWithoutPassword, id: '' };

      userService.findOne.mockResolvedValue(null);

      // 执行和断言
      await expect(service.login(userWithoutId)).rejects.toThrow(HttpException);

      try {
        await service.login(userWithoutId);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.USER_NOT_FOUND,
        );
      }
    });
  });

  describe('validateToken', () => {
    it('应该成功验证有效的JWT令牌', async () => {
      // 安排
      const token = 'valid.jwt.token';
      const mockPayload = {
        username: 'testuser',
        sub: '507f1f77bcf86cd799439011',
        role: 'user',
      };

      jwtService.verify.mockReturnValue(mockPayload);
      configService.get.mockReturnValue('test-secret');

      // 执行
      const result = await service.validateToken(token);

      // 断言
      expect(result).toEqual(mockPayload);
      expect(jwtService.verify).toHaveBeenCalledWith(token, {
        secret: 'test-secret',
      });
    });

    it('无效令牌时应该抛出令牌无效错误', async () => {
      // 安排
      const token = 'invalid.jwt.token';

      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      configService.get.mockReturnValue('test-secret');

      // 执行和断言
      await expect(service.validateToken(token)).rejects.toThrow(HttpException);

      try {
        await service.validateToken(token);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.INVALID_TOKEN,
        );
      }
    });
  });

  describe('changePassword', () => {
    it('应该成功修改密码', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const currentPassword = 'currentpassword';
      const newPassword = 'newpassword123';
      const userWithId = { id: userId, username: 'testuser' };

      userService.findById.mockResolvedValue(userWithId as any);
      userService.findOne.mockResolvedValue(mockUser as any);
      mockedBcrypt.compare
        .mockResolvedValueOnce(true) // 验证当前密码
        .mockResolvedValueOnce(false); // 检查新密码是否与当前密码相同

      // 执行
      await service.changePassword(userId, currentPassword, newPassword);

      // 断言
      expect(userService.updatePassword).toHaveBeenCalledWith(
        userId,
        newPassword,
      );
    });

    it('当前密码错误时应该抛出密码错误', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const currentPassword = 'wrongpassword';
      const newPassword = 'newpassword123';
      const userWithId = { id: userId, username: 'testuser' };

      userService.findById.mockResolvedValue(userWithId as any);
      userService.findOne.mockResolvedValue(mockUser as any);
      mockedBcrypt.compare.mockResolvedValue(false);

      // 执行和断言
      await expect(
        service.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(HttpException);

      try {
        await service.changePassword(userId, currentPassword, newPassword);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.INVALID_PASSWORD,
        );
      }
    });

    it('新密码与当前密码相同时应该抛出密码相同错误', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const currentPassword = 'samepassword';
      const newPassword = 'samepassword';
      const userWithId = { id: userId, username: 'testuser' };

      userService.findById.mockResolvedValue(userWithId as any);
      userService.findOne.mockResolvedValue(mockUser as any);
      // 使用mockResolvedValue而不是mockResolvedValueOnce，因为测试会调用两次
      mockedBcrypt.compare.mockResolvedValue(true);

      // 执行和断言
      await expect(
        service.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(HttpException);

      try {
        await service.changePassword(userId, currentPassword, newPassword);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.PASSWORD_SAME_AS_CURRENT,
        );
      }
    });

    it('用户不存在时应该抛出用户不存在错误', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const currentPassword = 'password';
      const newPassword = 'newpassword';

      userService.findById.mockResolvedValue(null);

      // 执行和断言
      await expect(
        service.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(HttpException);

      try {
        await service.changePassword(userId, currentPassword, newPassword);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.USER_NOT_FOUND,
        );
      }
    });
  });

  describe('resetPassword', () => {
    it('应该成功重置用户密码', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const userWithId = { id: userId, username: 'testuser', status: 'active' };
      const newPassword = 'newrandompassword';

      userService.findById.mockResolvedValue(userWithId as any);
      userService.generateRandomPassword.mockReturnValue(newPassword);

      // 执行
      const result = await service.resetPassword(userId);

      // 断言
      expect(result).toBe(newPassword);
      expect(userService.updatePassword).toHaveBeenCalledWith(
        userId,
        newPassword,
      );
    });

    it('用户不存在时应该抛出用户不存在错误', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';

      userService.findById.mockResolvedValue(null);

      // 执行和断言
      await expect(service.resetPassword(userId)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.resetPassword(userId);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.USER_NOT_FOUND,
        );
      }
    });

    it('用户被锁定时应该抛出账户锁定错误', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const lockedUser = { id: userId, username: 'testuser', status: 'locked' };

      userService.findById.mockResolvedValue(lockedUser as any);

      // 执行和断言
      await expect(service.resetPassword(userId)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.resetPassword(userId);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.ACCOUNT_LOCKED,
        );
      }
    });

    it('用户被禁用时应该抛出账户禁用错误', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const inactiveUser = {
        id: userId,
        username: 'testuser',
        status: 'inactive',
      };

      userService.findById.mockResolvedValue(inactiveUser as any);

      // 执行和断言
      await expect(service.resetPassword(userId)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.resetPassword(userId);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.ACCOUNT_DISABLED,
        );
      }
    });
  });

  describe('getProfile', () => {
    it('应该成功获取用户资料', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const userProfile = {
        id: userId,
        username: 'testuser',
        roles: [{ name: 'user' }],
        status: 'active',
        avatar: '',
        permissions: [],
        lastLoginTime: new Date(),
        lastLoginIp: '127.0.0.1',
      };

      userService.findById.mockResolvedValue(userProfile as any);

      // 执行
      const result = await service.getProfile(userId);

      // 断言
      expect(result).toEqual(userProfile);
    });

    it('用户不存在时应该抛出用户不存在错误', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';

      userService.findById.mockResolvedValue(null);

      // 执行和断言
      await expect(service.getProfile(userId)).rejects.toThrow(HttpException);

      try {
        await service.getProfile(userId);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.USER_NOT_FOUND,
        );
      }
    });
  });

  describe('getSecurityStats', () => {
    it('应该返回安全统计信息', () => {
      // 安排
      const username = 'testuser';
      const mockStats = {
        totalAttempts: 3,
        successfulAttempts: 2,
        failedAttempts: 1,
        lockedAccounts: 0,
        suspiciousAttempts: 0,
      };

      securityService.getLoginAttemptStats.mockReturnValue(mockStats);

      // 执行
      const result = service.getSecurityStats(username);

      // 断言
      expect(result).toEqual(mockStats);
      expect(securityService.getLoginAttemptStats).toHaveBeenCalledWith(
        username,
      );
    });
  });

  describe('unlockAccount', () => {
    it('应该成功解锁账户', () => {
      // 安排
      const username = 'testuser';
      const ip = '127.0.0.1';

      // 执行
      service.unlockAccount(username, ip);

      // 断言
      expect(securityService.unlockAccount).toHaveBeenCalledWith(username, ip);
    });
  });
});
