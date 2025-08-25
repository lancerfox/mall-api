import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SecurityService } from '../services/security.service';
import { User } from '../../user/entities/user.entity';
import { OperationLogService } from '../../log/services/operation-log.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('SecurityService', () => {
  let service: SecurityService;

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockOperationLogService = {
    logUserAction: jest.fn(),
  };

  beforeEach(async () => {
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'password123';
      const hashedPassword = 'hashedPassword';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('validatePassword', () => {
    it('should validate password successfully', async () => {
      const password = 'password123';
      const hashedPassword = 'hashedPassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(password, hashedPassword);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return false for invalid password', async () => {
      const password = 'wrongpassword';
      const hashedPassword = 'hashedPassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword(password, hashedPassword);

      expect(result).toBe(false);
    });
  });

  describe('generateRandomPassword', () => {
    it('should generate random password with default length', () => {
      const result = service.generateRandomPassword();

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(12);
    });

    it('should generate random password with custom length', () => {
      const length = 16;
      const result = service.generateRandomPassword(length);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(length);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const strongPassword = 'StrongPass123!';

      const result = service.validatePasswordStrength(strongPassword);

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(3);
    });

    it('should reject weak password', () => {
      const weakPassword = '123';

      const result = service.validatePasswordStrength(weakPassword);

      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(3);
      expect(result.suggestions).toContain('密码长度至少8位');
    });

    it('should provide suggestions for medium strength password', () => {
      const mediumPassword = 'password123';

      const result = service.validatePasswordStrength(mediumPassword);

      expect(result.isValid).toBe(false);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('recordLoginAttempt', () => {
    it('should record successful login attempt', async () => {
      const username = 'testuser';
      const success = true;

      // This method doesn't return anything, just ensure it doesn't throw
      await expect(
        service.recordLoginAttempt(username, success),
      ).resolves.not.toThrow();
    });

    it('should record failed login attempt', async () => {
      const username = 'testuser';
      const success = false;

      await expect(
        service.recordLoginAttempt(username, success),
      ).resolves.not.toThrow();
    });
  });

  describe('isAccountLocked', () => {
    it('should return false for non-locked account', async () => {
      const username = 'testuser';

      const result = await service.isAccountLocked(username);

      expect(result).toBe(false);
    });

    it('should return true for locked account', async () => {
      const username = 'lockeduser';

      // Simulate multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await service.recordLoginAttempt(username, false);
      }

      const result = await service.isAccountLocked(username);

      expect(result).toBe(true);
    });
  });

  describe('unlockAccount', () => {
    it('should unlock account successfully', async () => {
      const username = 'testuser';

      await expect(service.unlockAccount(username)).resolves.not.toThrow();
    });
  });
});
