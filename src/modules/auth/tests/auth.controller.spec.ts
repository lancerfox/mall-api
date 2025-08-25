import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ValidatePasswordDto } from '../dto/validate-password.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    refreshToken: jest.fn(),
    getUserProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    validateUser: jest.fn(),
  };

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    realName: 'Test User',
    role: 'admin',
    permissions: ['user:read', 'user:write'],
  };

  const mockRequest = {
    ip: '127.0.0.1',
    user: mockUser,
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
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };

      const mockLoginResponse = {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        user: mockUser,
        expires_in: 3600,
      };

      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto, mockRequest as any);

      expect(result).toBeDefined();
      expect(result.access_token).toBe(mockLoginResponse.access_token);
      expect(result.user.username).toBe(mockUser.username);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto,
        mockRequest.ip,
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshTokenDto = { refresh_token: 'valid_refresh_token' };
      const mockRefreshResponse = {
        access_token: 'new_access_token',
        expires_in: 3600,
      };

      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(result).toBeDefined();
      expect(result.access_token).toBe(mockRefreshResponse.access_token);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.refresh_token,
      );
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      mockAuthService.getUserProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockRequest as any);

      expect(result).toBeDefined();
      expect(result.username).toBe(mockUser.username);
      expect(mockAuthService.getUserProfile).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const updateProfileDto: UpdateProfileDto = {
        realName: 'Updated Name',
        email: 'updated@example.com',
      };

      const updatedUser = { ...mockUser, ...updateProfileDto };
      mockAuthService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(
        updateProfileDto,
        mockRequest as any,
      );

      expect(result).toBeDefined();
      expect(result.realName).toBe(updateProfileDto.realName);
      expect(mockAuthService.updateProfile).toHaveBeenCalledWith(
        mockUser.id,
        updateProfileDto,
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      };

      mockAuthService.changePassword.mockResolvedValue(undefined);

      const result = await controller.changePassword(
        changePasswordDto,
        mockRequest as any,
      );

      expect(result).toBeDefined();
      expect(result.message).toBe('密码修改成功');
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(
        mockUser.id,
        changePasswordDto,
      );
    });
  });

  describe('validatePassword', () => {
    it('should validate password successfully', async () => {
      const validatePasswordDto: ValidatePasswordDto = {
        password: 'password123',
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);

      const result = await controller.validatePassword(
        validatePasswordDto,
        mockRequest as any,
      );

      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        mockUser.username,
        validatePasswordDto.password,
      );
    });

    it('should return invalid for wrong password', async () => {
      const validatePasswordDto: ValidatePasswordDto = {
        password: 'wrongpassword',
      };

      mockAuthService.validateUser.mockRejectedValue(
        new Error('Invalid credentials'),
      );

      const result = await controller.validatePassword(
        validatePasswordDto,
        mockRequest as any,
      );

      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
    });
  });
});
