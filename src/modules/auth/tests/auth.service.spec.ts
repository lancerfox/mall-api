import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { UserService } from '../../user/services/user.service';
import { SecurityService } from '../services/security.service';
import { IUserWithoutPassword, ILoginResponse } from '../types';
import { UserInfoDto } from '../dto/auth-response.dto';
import { UserResponseDto } from '../../user/dto/user-response.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let securityService: SecurityService;

  const mockUserService = {
    findOne: jest.fn(),
    findById: jest.fn(),
    updateLastLogin: jest.fn(),
    updatePassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockSecurityService = {
    isAccountLocked: jest.fn(),
    getRemainingLockTime: jest.fn(),
    recordLoginAttempt: jest.fn(),
    getLoginAttemptStats: jest.fn(),
    unlockAccount: jest.fn(),
  };

  const mockUser: IUserWithoutPassword = {
    id: '123',
    username: 'testuser',
    roles: [{ id: '1', name: 'admin', description: '管理员' }],
    status: 'active',
    avatar: 'avatar.jpg',
    permissions: [],
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
  };

  const mockUserWithPassword = {
    ...mockUser,
    password: '$2b$10$hashedpassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SecurityService, useValue: mockSecurityService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    securityService = module.get<SecurityService>(SecurityService);
    jest.clearAllMocks();

    // 设置默认mock值
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_EXPIRES_IN') return '1h';
      return null;
    });

    mockSecurityService.isAccountLocked.mockReturnValue(false);
    mockSecurityService.getRemainingLockTime.mockReturnValue(5);
  });

  describe('validateUser', () => {
    it('应该成功验证用户凭据', async () => {
      mockUserService.findOne.mockResolvedValue(mockUserWithPassword);
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      const result = await authService.validateUser(
        'testuser',
        'password123',
        '127.0.0.1',
      );

      expect(userService.findOne).toHaveBeenCalledWith('testuser');
      expect(securityService.recordLoginAttempt).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('验证用户时应该处理密码错误', async () => {
      mockUserService.findOne.mockResolvedValue(mockUserWithPassword);
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

      const result = await authService.validateUser(
        'testuser',
        'wrongpassword',
        '127.0.0.1',
      );

      expect(result).toBeNull();
      expect(securityService.recordLoginAttempt).toHaveBeenCalledWith(
        'testuser',
        '127.0.0.1',
        false,
        undefined,
      );
    });

    it('验证用户时应该处理账户被锁定', async () => {
      mockSecurityService.isAccountLocked.mockReturnValue(true);

      await expect(
        authService.validateUser('lockeduser', 'password123', '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('验证用户时应该处理用户状态为锁定', async () => {
      const lockedUser = { ...mockUserWithPassword, status: 'locked' };
      mockUserService.findOne.mockResolvedValue(lockedUser);

      await expect(
        authService.validateUser('lockeduser', 'password123', '127.0.0.1'),
      ).rejects.toThrow('账户已被管理员锁定，请联系管理员');
    });

    it('验证用户时应该处理用户状态为禁用', async () => {
      const inactiveUser = { ...mockUserWithPassword, status: 'inactive' };
      mockUserService.findOne.mockResolvedValue(inactiveUser);

      await expect(
        authService.validateUser('inactiveuser', 'password123', '127.0.0.1'),
      ).rejects.toThrow('账户已被禁用，请联系管理员');
    });
  });

  describe('login', () => {
    it('应该成功登录并生成访问令牌', async () => {
      mockUserService.updateLastLogin.mockResolvedValue(undefined);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      mockUserService.findById.mockResolvedValue(mockUserWithPassword);

      const result = await authService.login(mockUser, '127.0.0.1');

      expect(userService.updateLastLogin).toHaveBeenCalledWith(
        '123',
        '127.0.0.1',
      );
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user).toBeDefined();
      expect(result.expires_in).toBe(3600);
    });

    it('登录时应该处理用户不存在', async () => {
      mockUserService.updateLastLogin.mockResolvedValue(undefined);
      mockUserService.findById.mockResolvedValue(null);

      await expect(authService.login(mockUser, '127.0.0.1')).rejects.toThrow(
        '用户不存在',
      );
    });
  });

  describe('getProfile', () => {
    it('应该成功获取用户资料', async () => {
      mockUserService.findById.mockResolvedValue(mockUserWithPassword);

      const result = await authService.getProfile('123');

      expect(userService.findById).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockUser);
    });

    it('获取资料时应该处理用户不存在', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(authService.getProfile('nonexistent')).rejects.toThrow(
        '用户不存在',
      );
    });
  });

  describe('changePassword', () => {
    it('应该成功修改密码', async () => {
      mockUserService.findById.mockResolvedValue(mockUserWithPassword);
      mockUserService.findOne.mockResolvedValue(mockUserWithPassword);
      jest
        .spyOn(require('bcrypt'), 'compare')
        .mockImplementation(async (input, hashed) => {
          // 当前密码比较返回 true，新密码比较返回 false
          return input === 'oldpassword';
        });
      mockUserService.updatePassword.mockResolvedValue(undefined);

      await authService.changePassword(
        '123',
        'oldpassword',
        'newpassword',
        '127.0.0.1',
      );

      expect(userService.updatePassword).toHaveBeenCalledWith(
        '123',
        'newpassword',
      );
    });

    it('修改密码时应该处理当前密码不正确', async () => {
      mockUserService.findById.mockResolvedValue(mockUserWithPassword);
      mockUserService.findOne.mockResolvedValue(mockUserWithPassword);
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

      await expect(
        authService.changePassword(
          '123',
          'wrongpassword',
          'newpassword',
          '127.0.0.1',
        ),
      ).rejects.toThrow('当前密码不正确');
    });

    it('修改密码时应该处理新密码与当前密码相同', async () => {
      mockUserService.findById.mockResolvedValue(mockUserWithPassword);
      mockUserService.findOne.mockResolvedValue(mockUserWithPassword);
      jest
        .spyOn(require('bcrypt'), 'compare')
        .mockImplementation(async (input, hashed) => {
          if (input === 'oldpassword') return true;
          return false;
        });

      await expect(
        authService.changePassword(
          '123',
          'oldpassword',
          'oldpassword',
          '127.0.0.1',
        ),
      ).rejects.toThrow('新密码不能与当前密码相同');
    });

    it('修改密码时应该处理用户不存在', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(
        authService.changePassword(
          'nonexistent',
          'oldpassword',
          'newpassword',
          '127.0.0.1',
        ),
      ).rejects.toThrow('用户不存在');
    });
  });

  describe('getSecurityStats', () => {
    it('应该返回安全统计信息', () => {
      const mockStats = {
        totalAttempts: 10,
        successfulAttempts: 8,
        failedAttempts: 2,
        lockedAccounts: 0,
      };

      mockSecurityService.getLoginAttemptStats.mockReturnValue(mockStats);

      const result = authService.getSecurityStats('testuser');

      expect(securityService.getLoginAttemptStats).toHaveBeenCalledWith(
        'testuser',
      );
      expect(result).toEqual(mockStats);
    });
  });

  describe('parseExpiresIn', () => {
    it('应该正确解析秒数', () => {
      const result = (authService as any).parseExpiresIn('30s');
      expect(result).toBe(30);
    });

    it('应该正确解析分钟数', () => {
      const result = (authService as any).parseExpiresIn('30m');
      expect(result).toBe(1800);
    });

    it('应该正确解析小时数', () => {
      const result = (authService as any).parseExpiresIn('2h');
      expect(result).toBe(7200);
    });

    it('应该正确解析天数', () => {
      const result = (authService as any).parseExpiresIn('7d');
      expect(result).toBe(604800);
    });

    it('应该返回默认值当格式无效时', () => {
      const result = (authService as any).parseExpiresIn('invalid');
      expect(result).toBe(3600);
    });
  });
});
