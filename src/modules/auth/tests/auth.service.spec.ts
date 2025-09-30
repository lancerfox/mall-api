import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import { UserService } from '../../user/services/user.service';
import { SecurityService } from '../services/security.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { IUserWithoutPassword, ILoginResponse } from '../types';
import { UserInfoDto } from '../dto/auth-response.dto';
import { UserResponseDto } from '../../user/dto/user-response.dto';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let securityService: jest.Mocked<SecurityService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

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
          provide: SecurityService,
          useValue: {
            isAccountLocked: jest.fn(),
            getRemainingLockTime: jest.fn(),
            recordLoginAttempt: jest.fn(),
            getLoginAttemptStats: jest.fn(),
            unlockAccount: jest.fn(),
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
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    securityService = module.get(SecurityService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Mock config values
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'JWT_SECRET':
          return 'test-secret';
        case 'JWT_EXPIRES_IN':
          return '1h';
        default:
          return null;
      }
    });
  });

  describe('validateUser', () => {
    it('应该在有效凭据时返回用户信息', async () => {
      // 安排
      const mockUser = {
        id: '1',
        username: 'testuser',
        password: 'hashedpassword',
        status: 'active',
        roles: [{ id: '1', name: 'user' }],
        avatar: null,
        permissions: ['user:read'],
        lastLoginTime: null,
        lastLoginIp: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedUser: IUserWithoutPassword = {
        id: '1',
        username: 'testuser',
        status: 'active',
        roles: [{ id: '1', name: 'user' }],
        avatar: null,
        permissions: ['user:read'],
        lastLoginTime: null,
        lastLoginIp: null,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      securityService.isAccountLocked.mockReturnValue(false);
      userService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // 执行
      const result = await authService.validateUser('testuser', 'password', '127.0.0.1');

      // 断言
      expect(result).toEqual(expectedUser);
      expect(securityService.recordLoginAttempt).toHaveBeenCalledWith(
        'testuser',
        '127.0.0.1',
        true,
      );
    });

    it('应该在账户被锁定时抛出异常', async () => {
      // 安排
      securityService.isAccountLocked.mockReturnValue(true);
      securityService.getRemainingLockTime.mockReturnValue(15);

      // 执行和断言
      await expect(
        authService.validateUser('testuser', 'password', '127.0.0.1'),
      ).rejects.toThrow(
        new HttpException('账户已被锁定，请在 15 分钟后重试', ERROR_CODES.ACCOUNT_LOCKED),
      );
    });

    it('应该在用户状态为locked时抛出异常', async () => {
      // 安排
      const mockUser = {
        id: '1',
        username: 'testuser',
        password: 'hashedpassword',
        status: 'locked',
      };

      securityService.isAccountLocked.mockReturnValue(false);
      userService.findOne.mockResolvedValue(mockUser);

      // 执行和断言
      await expect(
        authService.validateUser('testuser', 'password', '127.0.0.1'),
      ).rejects.toThrow(
        new HttpException('账户已被管理员锁定，请联系管理员', ERROR_CODES.ACCOUNT_LOCKED),
      );
    });

    it('应该在用户状态为inactive时抛出异常', async () => {
      // 安排
      const mockUser = {
        id: '1',
        username: 'testuser',
        password: 'hashedpassword',
        status: 'inactive',
      };

      securityService.isAccountLocked.mockReturnValue(false);
      userService.findOne.mockResolvedValue(mockUser);

      // 执行和断言
      await expect(
        authService.validateUser('testuser', 'password', '127.0.0.1'),
      ).rejects.toThrow(
        new HttpException('账户已被禁用，请联系管理员', ERROR_CODES.ACCOUNT_DISABLED),
      );
    });

    it('应该在密码不正确时返回null', async () => {
      // 安排
      const mockUser = {
        id: '1',
        username: 'testuser',
        password: 'hashedpassword',
        status: 'active',
      };

      securityService.isAccountLocked.mockReturnValue(false);
      userService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // 执行
      const result = await authService.validateUser('testuser', 'wrongpassword', '127.0.0.1');

      // 断言
      expect(result).toBeNull();
      expect(securityService.recordLoginAttempt).toHaveBeenCalledWith(
        'testuser',
        '127.0.0.1',
        false,
      );
    });
  });

  describe('login', () => {
    it('应该成功生成访问令牌', async () => {
      // 安排
      const mockUser: IUserWithoutPassword = {
        id: '1',
        username: 'testuser',
        roles: [{ id: '1', name: 'admin' }],
        status: 'active',
        permissions: ['admin:read'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'mock-access-token';
      jwtService.sign.mockReturnValue(mockToken);
      userService.updateLastLogin.mockResolvedValue(undefined);

      // 执行
      const result = await authService.login(mockUser, '127.0.0.1');

      // 断言
      expect(result).toEqual({
        access_token: mockToken,
        expires_in: 3600, // 1小时转换为秒
      });
      expect(userService.updateLastLogin).toHaveBeenCalledWith('1', '127.0.0.1');
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          username: 'testuser',
          sub: '1',
          role: 'admin',
        },
        {
          secret: 'test-secret',
          expiresIn: '1h',
        },
      );
    });

    it('应该在用户ID不存在时抛出异常', async () => {
      // 安排
      const mockUser = {
        username: 'testuser',
        roles: [{ name: 'admin' }],
      };

      userService.findOne.mockResolvedValue(null);

      // 执行和断言
      await expect(authService.login(mockUser, '127.0.0.1')).rejects.toThrow(
        new HttpException('用户不存在', ERROR_CODES.USER_NOT_FOUND),
      );
    });
  });

  describe('validateToken', () => {
    it('应该验证有效的JWT令牌', async () => {
      // 安排
      const mockToken = 'valid-token';
      const mockPayload = {
        username: 'testuser',
        sub: '1',
        role: 'admin',
      };

      jwtService.verify.mockReturnValue(mockPayload);

      // 执行
      const result = await authService.validateToken(mockToken);

      // 断言
      expect(result).toEqual(mockPayload);
      expect(jwtService.verify).toHaveBeenCalledWith(mockToken, {
        secret: 'test-secret',
      });
    });

    it('应该在令牌无效时抛出异常', async () => {
      // 安排
      const mockToken = 'invalid-token';
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // 执行和断言
      await expect(authService.validateToken(mockToken)).rejects.toThrow(
        new HttpException('访问令牌无效或已过期', ERROR_CODES.INVALID_TOKEN),
      );
    });
  });

  describe('getProfile', () => {
    it('应该成功获取用户资料', async () => {
      // 安排
      const mockUser: UserResponseDto = {
        id: '1',
        username: 'testuser',
        roles: [{ id: '1', name: 'user' }],
        status: 'active',
        avatar: 'avatar.jpg',
        permissions: ['user:read'],
        lastLoginTime: new Date(),
        lastLoginIp: '127.0.0.1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isSuperAdmin: false,
      };

      const expectedUserInfo: UserInfoDto = {
        id: '1',
        username: 'testuser',
        roles: [{ id: '1', name: 'user' }],
        status: 'active',
        avatar: 'avatar.jpg',
        permissions: ['user:read'],
        lastLoginTime: mockUser.lastLoginTime,
        lastLoginIp: '127.0.0.1',
      };

      userService.findById.mockResolvedValue(mockUser);

      // 执行
      const result = await authService.getProfile('1');

      // 断言
      expect(result).toEqual(expectedUserInfo);
    });

    it('应该在用户不存在时抛出异常', async () => {
      // 安排
      userService.findById.mockResolvedValue(null);

      // 执行和断言
      await expect(authService.getProfile('nonexistent')).rejects.toThrow(
        new HttpException('用户不存在', ERROR_CODES.USER_NOT_FOUND),
      );
    });
  });

  describe('changePassword', () => {
    it('应该成功修改密码', async () => {
      // 安排
      const mockUser = {
        id: '1',
        username: 'testuser',
        status: 'active',
        roles: [{ id: '1', name: 'user' }],
        permissions: ['user:read'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isSuperAdmin: false,
      };

      const mockUserWithPassword = {
        ...mockUser,
        password: 'hashed-old-password',
      };

      userService.findById.mockResolvedValue(mockUser);
      userService.findOne.mockResolvedValue(mockUserWithPassword);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)  // 当前密码验证
        .mockResolvedValueOnce(false); // 新密码与当前密码不同
      userService.updatePassword.mockResolvedValue(undefined);

      // 执行
      await authService.changePassword('1', 'oldpassword', 'newpassword123');

      // 断言
      expect(userService.updatePassword).toHaveBeenCalledWith('1', expect.any(String));
    });

    it('应该在当前密码不正确时抛出异常', async () => {
      // 安排
      const mockUser = {
        id: '1',
        username: 'testuser',
      };

      const mockUserWithPassword = {
        ...mockUser,
        password: 'hashed-old-password',
      };

      userService.findById.mockResolvedValue(mockUser);
      userService.findOne.mockResolvedValue(mockUserWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // 执行和断言
      await expect(
        authService.changePassword('1', 'wrongpassword', 'newpassword'),
      ).rejects.toThrow(
        new HttpException('当前密码不正确', ERROR_CODES.INVALID_PASSWORD),
      );
    });

    it('应该在新密码与当前密码相同时抛出异常', async () => {
      // 安排
      const mockUser = {
        id: '1',
        username: 'testuser',
        status: 'active',
        roles: [{ id: '1', name: 'user' }],
        permissions: ['user:read'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isSuperAdmin: false,
      };

      const mockUserWithPassword = {
        ...mockUser,
        password: 'hashed-password',
      };

      userService.findById.mockResolvedValue(mockUser);
      userService.findOne.mockResolvedValue(mockUserWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // 新密码与当前密码相同

      // 执行和断言
      await expect(
        authService.changePassword('1', 'password', 'password'),
      ).rejects.toThrow(
        new HttpException('新密码不能与当前密码相同', ERROR_CODES.PASSWORD_SAME_AS_CURRENT),
      );
    });
  });

  describe('resetPassword', () => {
    it('应该成功重置密码', async () => {
      // 安排
      const mockUser = {
        id: '1',
        username: 'testuser',
        status: 'active',
        roles: [{ id: '1', name: 'user' }],
        permissions: ['user:read'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isSuperAdmin: false,
      };

      const mockNewPassword = 'generated-password-123';
      
      userService.findById.mockResolvedValue(mockUser);
      userService.generateRandomPassword.mockReturnValue(mockNewPassword);
      userService.updatePassword.mockResolvedValue(undefined);

      // 执行
      const result = await authService.resetPassword('1');

      // 断言
      expect(result).toBe(mockNewPassword);
      expect(userService.updatePassword).toHaveBeenCalledWith('1', mockNewPassword);
    });

    it('应该在用户状态为locked时抛出异常', async () => {
      // 安排
      const mockUser = {
        id: '1',
        username: 'testuser',
        status: 'locked',
        roles: [{ id: '1', name: 'user' }],
        permissions: ['user:read'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isSuperAdmin: false,
      };

      userService.findById.mockResolvedValue(mockUser);

      // 执行和断言
      await expect(authService.resetPassword('1')).rejects.toThrow(
        new HttpException('账户已被锁定，无法重置密码', ERROR_CODES.ACCOUNT_LOCKED),
      );
    });
  });

  describe('parseExpiresIn', () => {
    it('应该正确解析秒数', () => {
      expect(authService['parseExpiresIn']('30s')).toBe(30);
    });

    it('应该正确解析分钟数', () => {
      expect(authService['parseExpiresIn']('30m')).toBe(1800);
    });

    it('应该正确解析小时数', () => {
      expect(authService['parseExpiresIn']('2h')).toBe(7200);
    });

    it('应该正确解析天数', () => {
      expect(authService['parseExpiresIn']('7d')).toBe(604800);
    });

    it('应该在无效输入时返回默认值', () => {
      expect(authService['parseExpiresIn']('invalid')).toBe(3600);
    });
  });
});