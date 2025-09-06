import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ILoginResponse, IUserWithoutPassword } from '../types';
import { UserInfoDto } from '../dto/auth-response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Public } from '../../../common/decorators/public.decorator';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    changePassword: jest.fn(),
    getSecurityStats: jest.fn(),
  };

  const mockUser: IUserWithoutPassword = {
    id: '123',
    username: 'testuser',
    roles: [{ id: '1', name: 'admin' }],
    status: 'active',
    avatar: 'avatar.jpg',
    permissions: [],
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
  };

  const mockLoginResponse: ILoginResponse = {
    access_token: 'mock-jwt-token',
    expires_in: 3600,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('应该成功登录并返回访问令牌', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(
        loginDto,
        { headers: {} } as any,
        '127.0.0.1',
      );

      expect(authService.validateUser).toHaveBeenCalledWith(
        'testuser',
        'password123',
        '127.0.0.1',
        undefined,
      );
      expect(authService.login).toHaveBeenCalledWith(
        mockUser,
        '127.0.0.1',
        undefined,
      );
      expect(result).toEqual(mockLoginResponse);
      expect(result.access_token).toBe('mock-jwt-token');
    });

    it('登录时应该处理用户名或密码错误', async () => {
      const loginDto: LoginDto = {
        username: 'wronguser',
        password: 'wrongpass',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(
        controller.login(loginDto, { headers: {} } as any, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
      expect(authService.validateUser).toHaveBeenCalled();
    });

    it('登录时应该处理用户账户被禁用的情况', async () => {
      const loginDto: LoginDto = {
        username: 'disableduser',
        password: 'password123',
      };

      mockAuthService.validateUser.mockRejectedValue(
        new UnauthorizedException('用户账户已被禁用或锁定'),
      );

      await expect(
        controller.login(loginDto, { headers: {} } as any, '127.0.0.1'),
      ).rejects.toThrow('用户账户已被禁用或锁定');
    });
  });

  describe('getProfile', () => {
    it('应该成功获取用户资料', async () => {
      const userInfo: UserInfoDto = {
        id: '123',
        username: 'testuser',
        roles: [{ id: '1', name: 'admin', description: '管理员' }],
        status: 'active',
        avatar: 'avatar.jpg',
        permissions: [],
        lastLoginTime: new Date(),
        lastLoginIp: '127.0.0.1',
      };

      mockAuthService.getProfile.mockResolvedValue(userInfo);

      const result = await controller.getProfile('123');

      expect(authService.getProfile).toHaveBeenCalledWith('123');
      expect(result).toEqual(userInfo);
      expect(result.username).toBe('testuser');
      expect(result.status).toBe('active');
    });

    it('获取资料时应该处理用户不存在的情况', async () => {
      mockAuthService.getProfile.mockRejectedValue(
        new UnauthorizedException('用户不存在'),
      );

      await expect(controller.getProfile('nonexistent')).rejects.toThrow(
        '用户不存在',
      );
    });
  });

  describe('changePassword', () => {
    it('应该成功修改密码', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
        confirmPassword: 'newpassword',
      };

      mockAuthService.changePassword.mockResolvedValue(undefined);

      const result = await controller.changePassword(
        changePasswordDto,
        '123',
        { headers: {} } as any,
        '127.0.0.1',
      );

      expect(authService.changePassword).toHaveBeenCalledWith(
        '123',
        'oldpassword',
        'newpassword',
        '127.0.0.1',
        undefined,
      );
      expect(result).toEqual({ message: '密码修改成功' });
    });

    it('修改密码时应该处理新密码和确认密码不一致', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
        confirmPassword: 'differentpassword',
      };

      await expect(
        controller.changePassword(
          changePasswordDto,
          '123',
          { headers: {} } as any,
          '127.0.0.1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('修改密码时应该处理当前密码不正确', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword',
        confirmPassword: 'newpassword',
      };

      mockAuthService.changePassword.mockRejectedValue(
        new UnauthorizedException('当前密码不正确'),
      );

      await expect(
        controller.changePassword(
          changePasswordDto,
          '123',
          { headers: {} } as any,
          '127.0.0.1',
        ),
      ).rejects.toThrow('当前密码不正确');
    });
  });

  describe('getSecurityStats', () => {
    it('应该返回安全统计信息', async () => {
      const mockStats = {
        totalAttempts: 10,
        successfulAttempts: 8,
        failedAttempts: 2,
        lockedAccounts: 0,
      };

      mockAuthService.getSecurityStats.mockReturnValue(mockStats);

      const result = controller.getSecurityStats({
        username: 'testuser',
      } as any);

      expect(authService.getSecurityStats).toHaveBeenCalledWith('testuser');
      expect(result).toEqual(mockStats);
      expect(result.totalAttempts).toBe(10);
      expect(result.successfulAttempts).toBe(8);
    });
  });
});
