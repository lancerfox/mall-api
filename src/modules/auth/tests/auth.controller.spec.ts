import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { OperationLogService } from '../../log/services/operation-log.service';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let operationLogService: jest.Mocked<OperationLogService>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    realName: '测试用户',
    role: 'admin',
    status: 'active',
    permissions: ['user:read'],
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
  };

  const mockLoginResponse = {
    access_token: 'mock-jwt-token',
    user: mockUser,
    expires_in: 3600,
  };

  const mockRequest = {
    headers: { 'user-agent': 'test-agent' },
  } as any;

  beforeEach(async () => {
    const mockAuthService = {
      validateUser: jest.fn(),
      login: jest.fn(),
      getProfile: jest.fn(),
      changePassword: jest.fn(),
      getSecurityStats: jest.fn(),
    };

    const mockOperationLogService = {
      logLogin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: OperationLogService, useValue: mockOperationLogService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    operationLogService = module.get(OperationLogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      username: 'testuser',
      password: 'password123',
    };

    it('should login successfully', async () => {
      authService.validateUser.mockResolvedValue(mockUser as any);
      authService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto, mockRequest, '127.0.0.1');

      expect(authService.validateUser).toHaveBeenCalledWith(
        'testuser',
        'password123',
        '127.0.0.1',
        'test-agent',
      );
      expect(authService.login).toHaveBeenCalledWith(
        mockUser,
        '127.0.0.1',
        'test-agent',
      );
      expect(result).toEqual(mockLoginResponse);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      authService.validateUser.mockResolvedValue(null);
      operationLogService.logLogin.mockResolvedValue({} as any);

      await expect(
        controller.login(loginDto, mockRequest, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);

      expect(operationLogService.logLogin).toHaveBeenCalledWith(
        '',
        'testuser',
        '127.0.0.1',
        'test-agent',
        'error',
        '用户名或密码错误',
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const inactiveUser = { ...mockUser, status: 'inactive' };
      authService.validateUser.mockResolvedValue(inactiveUser as any);
      operationLogService.logLogin.mockResolvedValue({} as any);

      await expect(
        controller.login(loginDto, mockRequest, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);

      expect(operationLogService.logLogin).toHaveBeenCalledWith(
        inactiveUser._id,
        inactiveUser.username,
        '127.0.0.1',
        'test-agent',
        'error',
        '用户账户已被禁用或锁定',
      );
    });

    it('should handle system errors', async () => {
      authService.validateUser.mockRejectedValue(new Error('Database error'));
      operationLogService.logLogin.mockResolvedValue({} as any);

      await expect(
        controller.login(loginDto, mockRequest, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);

      expect(operationLogService.logLogin).toHaveBeenCalledWith(
        '',
        'testuser',
        '127.0.0.1',
        'test-agent',
        'error',
        '系统错误',
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      authService.getProfile.mockResolvedValue(mockUser as any);

      const result = await controller.getProfile('507f1f77bcf86cd799439011');

      expect(authService.getProfile).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
    };

    it('should change password successfully', async () => {
      authService.changePassword.mockResolvedValue();

      const result = await controller.changePassword(
        changePasswordDto,
        '507f1f77bcf86cd799439011',
        mockRequest,
        '127.0.0.1',
      );

      expect(authService.changePassword).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'oldpassword',
        'newpassword123',
        '127.0.0.1',
        'test-agent',
      );
      expect(result).toEqual({ message: '密码修改成功' });
    });

    it('should throw BadRequestException for password mismatch', async () => {
      const invalidDto = {
        ...changePasswordDto,
        confirmPassword: 'differentpassword',
      };

      await expect(
        controller.changePassword(
          invalidDto,
          '507f1f77bcf86cd799439011',
          mockRequest,
          '127.0.0.1',
        ),
      ).rejects.toThrow(BadRequestException);
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
      authService.getSecurityStats.mockReturnValue(mockStats);

      const mockJwtUser = {
        sub: '507f1f77bcf86cd799439011',
        username: 'testuser',
        role: 'admin',
      };

      const result = controller.getSecurityStats(mockJwtUser as any);

      expect(authService.getSecurityStats).toHaveBeenCalledWith('testuser');
      expect(result).toEqual(mockStats);
    });
  });
});
