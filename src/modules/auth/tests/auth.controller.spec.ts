import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

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
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.validateUser and authService.login', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };
      const mockUser = { id: '1', username: 'testuser', roles: [] };
      const mockLoginResult = { access_token: 'token', expires_in: 3600 };

      (authService.validateUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.login as jest.Mock).mockResolvedValue(mockLoginResult);

      const result = await controller.login(loginDto, '127.0.0.1');

      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password,
        '127.0.0.1',
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser, '127.0.0.1');
      expect(result).toEqual(mockLoginResult);
    });
  });

  describe('getProfile', () => {
    it('should call authService.getProfile with userId', async () => {
      const mockProfile = { id: '1', username: 'testuser', permissions: [] };
      (authService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

      const result = await controller.getProfile('1');

      expect(authService.getProfile).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockProfile);
    });
  });

  describe('changePassword', () => {
    it('should throw ValidationError if new password and confirm password do not match', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'current123',
        newPassword: 'newPass123',
        confirmPassword: 'differentPass123',
      };

      await expect(
        controller.changePassword(changePasswordDto, '1'),
      ).rejects.toThrow(new BusinessException(ERROR_CODES.VALIDATION_FAILED));
    });

    it('should call authService.changePassword if passwords match', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'current123',
        newPassword: 'newPass123',
        confirmPassword: 'newPass123',
      };

      (authService.changePassword as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.changePassword(changePasswordDto, '1');

      expect(authService.changePassword).toHaveBeenCalledWith(
        '1',
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );
      expect(result).toEqual({ message: '密码修改成功' });
    });
  });

  describe('getSecurityStats', () => {
    it('should call authService.getSecurityStats with username', async () => {
      const mockStats = {
        totalAttempts: 10,
        successfulAttempts: 8,
        failedAttempts: 2,
      };
      (authService.getSecurityStats as jest.Mock).mockReturnValue(mockStats);

      const mockUser = { username: 'testuser' };

      const result = await controller.getSecurityStats(mockUser as any);

      expect(authService.getSecurityStats).toHaveBeenCalledWith('testuser');
      expect(result).toEqual(mockStats);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword and return new password', async () => {
      const resetPasswordDto: ResetPasswordDto = { id: '1' };
      const newPassword = 'generatedPassword123';

      (authService.resetPassword as jest.Mock).mockResolvedValue(newPassword);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.id,
      );
      expect(result).toEqual({
        message: '密码重置成功',
        newPassword,
      });
    });
  });
});
