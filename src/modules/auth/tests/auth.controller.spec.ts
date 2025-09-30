import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            getProfile: jest.fn(),
            changePassword: jest.fn(),
            getSecurityStats: jest.fn(),
            resetPassword: jest.fn(),
            validateToken: jest.fn(),
            unlockAccount: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('login', () => {
    it('应该在有效凭据时成功登录并返回访问令牌', async () => {
      // 安排
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'testpassword',
      };
      const mockUser = { id: '1', username: 'testuser' };
      const mockLoginResponse = {
        access_token: 'access_token',
        expires_in: 3600,
      };

      authService.validateUser.mockResolvedValue(mockUser);
      authService.login.mockResolvedValue(mockLoginResponse);

      // 执行
      const result = await authController.login(loginDto, '127.0.0.1');

      // 断言
      expect(result).toEqual(mockLoginResponse);
      expect(authService.validateUser).toHaveBeenCalledWith(
        'testuser',
        'testpassword',
        '127.0.0.1',
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser, '127.0.0.1');
    });

    it('应该在无效凭据时抛出未授权异常', async () => {
      // 安排
      const loginDto: LoginDto = {
        username: 'invaliduser',
        password: 'invalidpassword',
      };

      authService.validateUser.mockResolvedValue(null);

      // 执行和断言
      await expect(authController.login(loginDto, '127.0.0.1')).rejects.toThrow(
        new UnauthorizedException({
          message: '用户名或密码错误',
          errorCode: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        }),
      );
    });

    it('应该在登录过程中发生其他错误时抛出通用登录失败异常', async () => {
      // 安排
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'testpassword',
      };

      authService.validateUser.mockRejectedValue(new Error('Database error'));

      // 执行和断言
      await expect(authController.login(loginDto, '127.0.0.1')).rejects.toThrow(
        new UnauthorizedException({
          message: '登录失败，请稍后重试',
          errorCode: ERROR_CODES.AUTH_LOGIN_FAILED,
        }),
      );
    });
  });

  describe('getProfile', () => {
    it('应该成功获取当前用户资料', async () => {
      // 安排
      const userId = 'user123';
      const mockProfile = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        roles: [],
        status: 'active',
        permissions: [],
      };

      authService.getProfile.mockResolvedValue(mockProfile);

      // 执行
      const result = await authController.getProfile(userId);

      // 断言
      expect(result).toEqual(mockProfile);
      expect(authService.getProfile).toHaveBeenCalledWith(userId);
    });
  });

  describe('changePassword', () => {
    it('应该在新密码和确认密码一致时成功修改密码', async () => {
      // 安排
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
        confirmPassword: 'newpassword',
      };
      const userId = 'user123';

      authService.changePassword.mockResolvedValue();

      // 执行
      const result = await authController.changePassword(
        changePasswordDto,
        userId,
      );

      // 断言
      expect(result).toEqual({ message: '密码修改成功' });
      expect(authService.changePassword).toHaveBeenCalledWith(
        userId,
        'oldpassword',
        'newpassword',
      );
    });

    it('应该在新密码和确认密码不一致时抛出错误', async () => {
      // 安排
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
        confirmPassword: 'differentpassword',
      };

      // 执行和断言
      await expect(
        authController.changePassword(changePasswordDto, 'user123'),
      ).rejects.toThrow(
        new BadRequestException({
          message: '新密码和确认密码不一致',
          errorCode: ERROR_CODES.AUTH_PASSWORD_MISMATCH,
        }),
      );
    });
  });

  describe('getSecurityStats', () => {
    it('应该成功获取安全统计信息', async () => {
      // 安排
      const mockUser = { sub: '123', username: 'testuser' };
      const mockStats = {
        totalAttempts: 10,
        successfulAttempts: 8,
        failedAttempts: 2,
        lockedAccounts: 1,
      };

      authService.getSecurityStats.mockResolvedValue(mockStats);

      // 执行
      const result = await authController.getSecurityStats(mockUser);

      // 断言
      expect(result).toEqual(mockStats);
      expect(authService.getSecurityStats).toHaveBeenCalledWith('testuser');
    });

    it('应该在用户没有用户名时处理空用户名', async () => {
      // 安排
      const mockUser = { sub: '123' }; // 没有username
      const mockStats = {
        totalAttempts: 0,
        successfulAttempts: 0,
        failedAttempts: 0,
        lockedAccounts: 0,
      };

      authService.getSecurityStats.mockResolvedValue(mockStats);

      // 执行
      const result = await authController.getSecurityStats(mockUser);

      // 断言
      expect(result).toEqual(mockStats);
      expect(authService.getSecurityStats).toHaveBeenCalledWith(undefined);
    });
  });

  describe('resetPassword', () => {
    it('应该成功重置密码', async () => {
      // 安排
      const resetPasswordDto: ResetPasswordDto = {
        id: 'user123',
      };
      const mockNewPassword = 'new-generated-password';

      authService.resetPassword.mockResolvedValue(mockNewPassword);

      // 执行
      const result = await authController.resetPassword(resetPasswordDto);

      // 断言
      expect(result).toEqual({
        message: '密码重置成功',
        newPassword: mockNewPassword,
      });
      expect(authService.resetPassword).toHaveBeenCalledWith('user123');
    });
  });
});
