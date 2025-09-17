import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ERROR_CODES } from '../../../common/constants/error-codes';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockRequest = {
    headers: {
      'user-agent': 'test-browser',
    },
    ip: '127.0.0.1',
  } as any;

  const mockLoginResponse = {
    access_token: 'mock-jwt-token',
    expires_in: 3600,
  };

  const mockUserProfile = {
    id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    roles: [{ id: '507f1f77bcf86cd799439012', name: 'user' }],
    status: 'active',
    avatar: '',
    permissions: [],
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
  };

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
            resetPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

    // 重置所有mock
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('应该成功登录并返回访问令牌', async () => {
      // 安排
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };

      const mockUser = {
        id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        roles: [{ id: '507f1f77bcf86cd799439012', name: 'user' }],
        status: 'active',
      };

      authService.validateUser.mockResolvedValue(mockUser as any);
      authService.login.mockResolvedValue(mockLoginResponse);

      // 执行
      const result = await controller.login(loginDto, mockRequest, '127.0.0.1');

      // 断言
      expect(result).toEqual(mockLoginResponse);
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password,
        '127.0.0.1',
        'test-browser',
      );
      expect(authService.login).toHaveBeenCalledWith(
        mockUser,
        '127.0.0.1',
        'test-browser',
      );
    });

    it('用户验证失败时应该抛出认证错误', async () => {
      // 安排
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      authService.validateUser.mockResolvedValue(null);

      // 执行和断言
      await expect(
        controller.login(loginDto, mockRequest, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);

      try {
        await controller.login(loginDto, mockRequest, '127.0.0.1');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        const exception = error as UnauthorizedException;
        const response = exception.getResponse() as any;
        expect(response.errorCode).toBe(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
      }
    });

    it('认证服务抛出错误时应该处理并重新抛出', async () => {
      // 安排
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };

      authService.validateUser.mockRejectedValue(new Error('Database error'));

      // 执行和断言
      await expect(
        controller.login(loginDto, mockRequest, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);

      try {
        await controller.login(loginDto, mockRequest, '127.0.0.1');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        const exception = error as UnauthorizedException;
        const response = exception.getResponse() as any;
        expect(response.errorCode).toBe(ERROR_CODES.AUTH_LOGIN_FAILED);
      }
    });

    it('已经是UnauthorizedException的错误应该直接传递', async () => {
      // 安排
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };

      const originalError = new UnauthorizedException({
        message: '账户已被锁定',
        errorCode: ERROR_CODES.ACCOUNT_LOCKED,
      });

      authService.validateUser.mockRejectedValue(originalError);

      // 执行和断言
      await expect(
        controller.login(loginDto, mockRequest, '127.0.0.1'),
      ).rejects.toThrow(originalError);
    });
  });

  describe('getProfile', () => {
    it('应该成功获取用户资料', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';

      authService.getProfile.mockResolvedValue(mockUserProfile as any);

      // 执行
      const result = await controller.getProfile(userId);

      // 断言
      expect(result).toEqual(mockUserProfile);
      expect(authService.getProfile).toHaveBeenCalledWith(userId);
    });

    it('用户不存在时应该传递认证服务的错误', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const expectedError = new HttpException(
        '用户不存在',
        ERROR_CODES.USER_NOT_FOUND,
      );

      authService.getProfile.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.getProfile(userId)).rejects.toThrow(
        expectedError,
      );
    });
  });

  describe('changePassword', () => {
    it('应该成功修改密码', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      authService.changePassword.mockResolvedValue(undefined);

      // 执行
      const result = await controller.changePassword(
        changePasswordDto,
        userId,
        mockRequest,
        '127.0.0.1',
      );

      // 断言
      expect(result).toEqual({
        message: '密码修改成功',
      });
      expect(authService.changePassword).toHaveBeenCalledWith(
        userId,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
        '127.0.0.1',
        'test-browser',
      );
    });

    it('新密码和确认密码不匹配时应该抛出验证错误', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword',
      };

      // 执行和断言
      await expect(
        controller.changePassword(
          changePasswordDto,
          userId,
          mockRequest,
          '127.0.0.1',
        ),
      ).rejects.toThrow(BadRequestException);

      try {
        await controller.changePassword(
          changePasswordDto,
          userId,
          mockRequest,
          '127.0.0.1',
        );
      } catch (error) {
        // 检查HTTP状态码，因为BadRequestException返回400
        expect((error as BadRequestException).getStatus()).toBe(400);
        // 检查错误响应中的业务错误码
        const response = (error as BadRequestException).getResponse() as any;
        expect(response.errorCode).toBe(ERROR_CODES.AUTH_PASSWORD_MISMATCH);
      }
    });

    it('当前密码错误时应该传递认证服务的错误', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      const expectedError = new HttpException(
        '当前密码不正确',
        ERROR_CODES.INVALID_PASSWORD,
      );
      authService.changePassword.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(
        controller.changePassword(
          changePasswordDto,
          userId,
          mockRequest,
          '127.0.0.1',
        ),
      ).rejects.toThrow(expectedError);
    });
  });

  describe('resetPassword', () => {
    it('应该成功重置密码', async () => {
      // 安排
      const resetPasswordDto: ResetPasswordDto = {
        id: '507f1f77bcf86cd799439011',
      };
      const newPassword = 'newrandompassword';

      authService.resetPassword.mockResolvedValue(newPassword);

      // 执行
      const result = await controller.resetPassword(resetPasswordDto);

      // 断言
      expect(result).toEqual({
        message: '密码重置成功',
        newPassword,
      });
      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.id,
      );
    });

    it('用户不存在时应该传递认证服务的错误', async () => {
      // 安排
      const resetPasswordDto: ResetPasswordDto = {
        id: '507f1f77bcf86cd799439011',
      };

      const expectedError = new HttpException(
        '用户不存在',
        ERROR_CODES.USER_NOT_FOUND,
      );
      authService.resetPassword.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        expectedError,
      );
    });

    it('账户被锁定时应该传递认证服务的错误', async () => {
      // 安排
      const resetPasswordDto: ResetPasswordDto = {
        id: '507f1f77bcf86cd799439011',
      };

      const expectedError = new HttpException(
        '账户已被锁定，无法重置密码',
        ERROR_CODES.ACCOUNT_LOCKED,
      );
      authService.resetPassword.mockRejectedValue(expectedError);

      // 执行和断言
      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        expectedError,
      );
    });
  });
});
