import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SecurityService } from '../services/security.service';
import { User, UserDocument } from '../../user/entities/user.entity';
import { OperationLogService } from '../../log/services/operation-log.service';

describe('SecurityService', () => {
  let service: SecurityService;
  let userModel: jest.Mocked<Model<UserDocument>>;
  let operationLogService: jest.Mocked<OperationLogService>;

  beforeEach(async () => {
    const mockUserModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
    };

    const mockOperationLogService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: OperationLogService,
          useValue: mockOperationLogService,
        },
      ],
    }).compile();

    service = module.get<SecurityService>(SecurityService);
    userModel = module.get(getModelToken(User.name));
    operationLogService = module.get(OperationLogService);

    // Clear any existing intervals
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordLoginAttempt', () => {
    it('should record successful login attempt', () => {
      service.recordLoginAttempt('testuser', '127.0.0.1', true, 'test-agent');

      // Verify that the attempt was recorded (internal state)
      expect(service.isAccountLocked('testuser', '127.0.0.1')).toBe(false);
    });

    it('should record failed login attempt', () => {
      service.recordLoginAttempt('testuser', '127.0.0.1', false, 'test-agent');

      // Account should not be locked after just one failed attempt
      expect(service.isAccountLocked('testuser', '127.0.0.1')).toBe(false);
    });

    it('should lock account after max failed attempts', () => {
      // Record 5 failed attempts (default max)
      for (let i = 0; i < 5; i++) {
        service.recordLoginAttempt(
          'testuser',
          '127.0.0.1',
          false,
          'test-agent',
        );
      }

      expect(service.isAccountLocked('testuser', '127.0.0.1')).toBe(true);
    });
  });

  describe('isAccountLocked', () => {
    it('should return false for non-locked account', () => {
      const result = service.isAccountLocked('testuser', '127.0.0.1');
      expect(result).toBe(false);
    });

    it('should return true for locked account', () => {
      // Lock the account by recording max failed attempts
      for (let i = 0; i < 5; i++) {
        service.recordLoginAttempt(
          'testuser',
          '127.0.0.1',
          false,
          'test-agent',
        );
      }

      const result = service.isAccountLocked('testuser', '127.0.0.1');
      expect(result).toBe(true);
    });
  });

  describe('getRemainingLockTime', () => {
    it('should return 0 for non-locked account', () => {
      const result = service.getRemainingLockTime('testuser', '127.0.0.1');
      expect(result).toBe(0);
    });

    it('should return remaining time for locked account', () => {
      // Lock the account
      for (let i = 0; i < 5; i++) {
        service.recordLoginAttempt(
          'testuser',
          '127.0.0.1',
          false,
          'test-agent',
        );
      }

      const result = service.getRemainingLockTime('testuser', '127.0.0.1');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(30); // Default lockout duration is 30 minutes
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const result = service.validatePasswordStrength('StrongPass123!');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(80);
    });

    it('should reject weak password', () => {
      const result = service.validatePasswordStrength('weak');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(50);
    });

    it('should reject password without uppercase', () => {
      const result = service.validatePasswordStrength('lowercase123!');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个大写字母');
    });

    it('should reject password without lowercase', () => {
      const result = service.validatePasswordStrength('UPPERCASE123!');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个小写字母');
    });

    it('should reject password without numbers', () => {
      const result = service.validatePasswordStrength('NoNumbers!');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个数字');
    });

    it('should reject password without special characters', () => {
      const result = service.validatePasswordStrength('NoSpecial123');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个特殊字符');
    });

    it('should reject password that is too short', () => {
      const result = service.validatePasswordStrength('Short1!');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码长度至少需要8位');
    });

    it('should give bonus points for longer passwords', () => {
      const shortResult = service.validatePasswordStrength('Pass123!');
      const longResult = service.validatePasswordStrength(
        'VeryLongStrongPassword123!@#$',
      );

      // Both passwords should be valid but longer password should get bonus points
      expect(shortResult.isValid).toBe(true);
      expect(longResult.isValid).toBe(true);
      expect(longResult.score).toBeGreaterThanOrEqual(shortResult.score);
    });
  });

  describe('unlockAccount', () => {
    it('should unlock locked account', () => {
      // Lock the account first
      for (let i = 0; i < 5; i++) {
        service.recordLoginAttempt(
          'testuser',
          '127.0.0.1',
          false,
          'test-agent',
        );
      }

      expect(service.isAccountLocked('testuser', '127.0.0.1')).toBe(true);

      // Unlock the account
      service.unlockAccount('testuser', '127.0.0.1');

      expect(service.isAccountLocked('testuser', '127.0.0.1')).toBe(false);
    });
  });

  describe('getLoginAttemptStats', () => {
    it('should return login attempt statistics', () => {
      // Record some attempts
      service.recordLoginAttempt('user1', '127.0.0.1', true, 'test-agent');
      service.recordLoginAttempt('user1', '127.0.0.1', false, 'test-agent');
      service.recordLoginAttempt('user2', '192.168.1.1', true, 'test-agent');

      const result = service.getLoginAttemptStats();

      expect(result).toHaveProperty('totalAttempts');
      expect(result).toHaveProperty('successfulAttempts');
      expect(result).toHaveProperty('failedAttempts');
      expect(result).toHaveProperty('lockedAccounts');
      expect(result.totalAttempts).toBe(3);
      expect(result.successfulAttempts).toBe(2);
      expect(result.failedAttempts).toBe(1);
    });

    it('should return statistics for specific user', () => {
      // Record attempts for different users
      service.recordLoginAttempt('user1', '127.0.0.1', true, 'test-agent');
      service.recordLoginAttempt('user1', '127.0.0.1', false, 'test-agent');
      service.recordLoginAttempt('user2', '192.168.1.1', true, 'test-agent');

      const result = service.getLoginAttemptStats('user1');

      expect(result.totalAttempts).toBe(2);
      expect(result.successfulAttempts).toBe(1);
      expect(result.failedAttempts).toBe(1);
    });
  });
});
