import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services/user.service';
import { SecurityService } from '../services/security.service';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { RoleResponseDto } from '../../role/dto/role-response.dto';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let securityService: SecurityService;

  // Mock数据
  const mockUser = {
    id: '1',
    username: 'testuser',
    password: 'hashedPassword',
    status: 'active',
    roles: [{ id: 'role1', name: 'admin' }] as RoleResponseDto[],
    permissions: [],
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as UserResponseDto;

  const mockProfile = {
    id: '1',
    username: 'testuser',
    roles: [{ id: 'role1', name: 'admin' }],
    status: 'active',
    permissions: ['read', 'write'],
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
    avatar: null,
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
            sign: jest.fn().mockReturnValue('mocked-jwt-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const configMap: { [key: string]: any } = {
                JWT_SECRET: 'test-secret',
                JWT_EXPIRES_IN: '1h',
              };
              return configMap[key] || defaultValue;
            }),
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
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    securityService = module.get<SecurityService>(SecurityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should throw ACCOUNT_LOCKED error if account is locked', async () => {
      (securityService.isAccountLocked as jest.Mock).mockReturnValue(true);
      (securityService.getRemainingLockTime as jest.Mock).mockReturnValue(10);

      await expect(
        service.validateUser('testuser', 'password', '127.0.0.1'),
      ).rejects.toThrow(new BusinessException(ERROR_CODES.ACCOUNT_LOCKED));
    });

    it('should throw ACCOUNT_LOCKED error if user status is locked', async () => {
      (securityService.isAccountLocked as jest.Mock).mockReturnValue(false);
      (userService.findOne as jest.Mock).mockResolvedValue({
        ...mockUser,
        status: 'locked',
      });

      await expect(
        service.validateUser('testuser', 'password', '127.0.0.1'),
      ).rejects.toThrow(new BusinessException(ERROR_CODES.ACCOUNT_LOCKED));
    });

    it('should throw ACCOUNT_DISABLED error if user status is inactive', async () => {
      (securityService.isAccountLocked as jest.Mock).mockReturnValue(false);
      (userService.findOne as jest.Mock).mockResolvedValue({
        ...mockUser,
        status: 'inactive',
      });

      await expect(
        service.validateUser('testuser', 'password', '127.0.0.1'),
      ).rejects.toThrow(new BusinessException(ERROR_CODES.ACCOUNT_DISABLED));
    });

    it('should throw AUTH_INVALID_CREDENTIALS error if user not found', async () => {
      (securityService.isAccountLocked as jest.Mock).mockReturnValue(false);
      (userService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.validateUser('testuser', 'password', '127.0.0.1'),
      ).rejects.toThrow(
        new BusinessException(ERROR_CODES.AUTH_INVALID_CREDENTIALS),
      );
    });

    it('should throw AUTH_INVALID_CREDENTIALS error if password is incorrect', async () => {
      (securityService.isAccountLocked as jest.Mock).mockReturnValue(false);
      (userService.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('testuser', 'password', '127.0.0.1'),
      ).rejects.toThrow(
        new BusinessException(ERROR_CODES.AUTH_INVALID_CREDENTIALS),
      );
    });

    it('should return user info without password if credentials are valid', async () => {
      (securityService.isAccountLocked as jest.Mock).mockReturnValue(false);
      (userService.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (userService.findById as jest.Mock).mockResolvedValue(mockUser);
      (service as any).formatUserInfo = jest.fn().mockReturnValue(mockProfile);

      const result = await service.validateUser(
        'testuser',
        'password',
        '127.0.0.1',
      );

      expect(result).toEqual({
        ...mockUser,
        password: undefined,
        permissions: mockProfile.permissions,
      });
      expect(securityService.recordLoginAttempt).toHaveBeenCalledWith(
        'testuser',
        '127.0.0.1',
        true,
      );
    });
  });

  describe('login', () => {
    it('should throw AUTH_USER_INFO_MISSING error if user id is missing', async () => {
      await expect(service.login({ id: undefined } as any)).rejects.toThrow(
        new BusinessException(ERROR_CODES.AUTH_USER_INFO_MISSING),
      );
    });

    it('should return access token and expiration time', async () => {
      const userWithoutPassword = { ...mockUser, password: undefined };
      (userService.updateLastLogin as jest.Mock).mockResolvedValue(undefined);

      const result = await service.login(userWithoutPassword, '127.0.0.1');

      expect(userService.updateLastLogin).toHaveBeenCalledWith(
        '1',
        '127.0.0.1',
      );
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
      expect(result).toEqual({
        access_token: 'mocked-jwt-token',
        expires_in: 3600,
      });
    });
  });

  describe('validateToken', () => {
    it('should return payload if token is valid', async () => {
      const mockPayload = { username: 'testuser', sub: '1', role: 'admin' };
      (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = await service.validateToken('valid-token');

      expect(result).toEqual(mockPayload);
    });

    it('should throw AUTH_TOKEN_INVALID error if token is invalid', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        new BusinessException(ERROR_CODES.AUTH_TOKEN_INVALID),
      );
    });
  });

  describe('getProfile', () => {
    it('should throw USER_NOT_FOUND error if user not found', async () => {
      (userService.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getProfile('nonexistent-id')).rejects.toThrow(
        new BusinessException(ERROR_CODES.USER_NOT_FOUND),
      );
    });

    it('should return formatted user profile', async () => {
      (userService.findById as jest.Mock).mockResolvedValue(mockUser);
      (service as any).formatUserInfo = jest.fn().mockReturnValue(mockProfile);

      const result = await service.getProfile('1');

      expect(result).toEqual(mockProfile);
    });
  });

  describe('changePassword', () => {
    it('should throw USER_NOT_FOUND error if user not found', async () => {
      (userService.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.changePassword(
          'nonexistent-id',
          'current-password',
          'new-password',
        ),
      ).rejects.toThrow(new BusinessException(ERROR_CODES.USER_NOT_FOUND));
    });

    it('should throw AUTH_PASSWORD_MISMATCH error if current password is incorrect', async () => {
      (userService.findById as jest.Mock).mockResolvedValue(mockUser);
      (userService.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false); // 第一次比较：当前密码不正确

      await expect(
        service.changePassword('1', 'wrong-password', 'new-password'),
      ).rejects.toThrow(
        new BusinessException(ERROR_CODES.AUTH_PASSWORD_MISMATCH),
      );
    });

    it('should throw PASSWORD_SAME_AS_CURRENT error if new password is the same as current', async () => {
      (userService.findById as jest.Mock).mockResolvedValue(mockUser);
      (userService.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // 第一次比较：当前密码正确
        .mockResolvedValueOnce(true); // 第二次比较：新密码与当前密码相同

      await expect(
        service.changePassword('1', 'current-password', 'current-password'),
      ).rejects.toThrow(
        new BusinessException(ERROR_CODES.PASSWORD_SAME_AS_CURRENT),
      );
    });

    it('should update password if all validations pass', async () => {
      (userService.findById as jest.Mock).mockResolvedValue(mockUser);
      (userService.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // 第一次比较：当前密码正确
        .mockResolvedValueOnce(false); // 第二次比较：新密码与当前密码不同
      (userService.updatePassword as jest.Mock).mockResolvedValue(undefined);

      await expect(
        service.changePassword('1', 'current-password', 'new-password'),
      ).resolves.not.toThrow();

      expect(userService.updatePassword).toHaveBeenCalledWith(
        '1',
        'new-password',
      );
    });
  });

  describe('resetPassword', () => {
    it('should throw USER_NOT_FOUND error if user not found', async () => {
      (userService.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.resetPassword('nonexistent-id')).rejects.toThrow(
        new BusinessException(ERROR_CODES.USER_NOT_FOUND),
      );
    });

    it('should throw ACCOUNT_LOCKED error if user status is locked', async () => {
      (userService.findById as jest.Mock).mockResolvedValue({
        ...mockUser,
        status: 'locked',
      });

      await expect(service.resetPassword('1')).rejects.toThrow(
        new BusinessException(ERROR_CODES.ACCOUNT_LOCKED),
      );
    });

    it('should throw ACCOUNT_DISABLED error if user status is inactive', async () => {
      (userService.findById as jest.Mock).mockResolvedValue({
        ...mockUser,
        status: 'inactive',
      });

      await expect(service.resetPassword('1')).rejects.toThrow(
        new BusinessException(ERROR_CODES.ACCOUNT_DISABLED),
      );
    });

    it('should update password and return new password', async () => {
      const newPassword = 'generated-password';
      (userService.findById as jest.Mock).mockResolvedValue(mockUser);
      (userService.generateRandomPassword as jest.Mock).mockReturnValue(
        newPassword,
      );
      (userService.updatePassword as jest.Mock).mockResolvedValue(undefined);

      const result = await service.resetPassword('1');

      expect(userService.generateRandomPassword).toHaveBeenCalledWith(10);
      expect(userService.updatePassword).toHaveBeenCalledWith('1', newPassword);
      expect(result).toBe(newPassword);
    });
  });

  describe('getSecurityStats', () => {
    it('should call securityService.getLoginAttemptStats with username', () => {
      const mockStats = {
        totalAttempts: 10,
        successfulAttempts: 8,
        failedAttempts: 2,
      };
      (securityService.getLoginAttemptStats as jest.Mock).mockReturnValue(
        mockStats,
      );

      const result = service.getSecurityStats('testuser');

      expect(securityService.getLoginAttemptStats).toHaveBeenCalledWith(
        'testuser',
      );
      expect(result).toEqual(mockStats);
    });
  });

  describe('unlockAccount', () => {
    it('should call securityService.unlockAccount', () => {
      (securityService.unlockAccount as jest.Mock).mockReturnValue(undefined);

      service.unlockAccount('testuser', '127.0.0.1');

      expect(securityService.unlockAccount).toHaveBeenCalledWith(
        'testuser',
        '127.0.0.1',
      );
    });
  });

  describe('parseExpiresIn', () => {
    it('should correctly parse seconds', () => {
      expect((service as any).parseExpiresIn('30s')).toBe(30);
    });

    it('should correctly parse minutes', () => {
      expect((service as any).parseExpiresIn('30m')).toBe(1800); // 30 * 60
    });

    it('should correctly parse hours', () => {
      expect((service as any).parseExpiresIn('2h')).toBe(7200); // 2 * 60 * 60
    });

    it('should correctly parse days', () => {
      expect((service as any).parseExpiresIn('7d')).toBe(604800); // 7 * 24 * 60 * 60
    });

    it('should return default (3600) for invalid input', () => {
      expect((service as any).parseExpiresIn('invalid')).toBe(3600);
      expect((service as any).parseExpiresIn('')).toBe(3600);
    });
  });
});
