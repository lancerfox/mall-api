import { Test, TestingModule } from '@nestjs/testing';
import { SecurityService } from '../services/security.service';

describe('SecurityService', () => {
  let service: SecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityService],
    }).compile();

    service = module.get<SecurityService>(SecurityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordLoginAttempt', () => {
    it('should record a successful login attempt', () => {
      const username = 'testuser';
      const ip = '127.0.0.1';
      const success = true;

      service['loginAttempts'] = new Map();

      service.recordLoginAttempt(username, ip, success);

      const key = `${username}:${ip}`;
      const attempts = service['loginAttempts'].get(key);

      expect(attempts).toBeDefined();
      expect(attempts!.length).toBe(1);
      expect(attempts![0].username).toBe(username);
      expect(attempts![0].ip).toBe(ip);
      expect(attempts![0].success).toBe(success);
    });

    it('should record a failed login attempt', () => {
      const username = 'testuser';
      const ip = '127.0.0.1';
      const success = false;

      service['loginAttempts'] = new Map();

      service.recordLoginAttempt(username, ip, success);

      const key = `${username}:${ip}`;
      const attempts = service['loginAttempts'].get(key);

      expect(attempts).toBeDefined();
      expect(attempts!.length).toBe(1);
      expect(attempts![0].success).toBe(success);
    });
  });

  describe('isAccountLocked', () => {
    it('should return false if account is not locked', () => {
      const result = service.isAccountLocked('testuser', '127.0.0.1');
      expect(result).toBe(false);
    });

    it('should return false if lock time has expired', () => {
      const username = 'testuser';
      const ip = '127.0.0.1';
      const lockTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      const key = `${username}:${ip}`;

      service['lockedAccounts'] = new Map();
      service['lockedAccounts'].set(key, lockTime);

      const result = service.isAccountLocked(username, ip);
      expect(result).toBe(false);
      expect(service['lockedAccounts'].has(key)).toBe(false); // Account should be unlocked
    });

    it('should return true if account is currently locked', () => {
      const username = 'testuser';
      const ip = '127.0.0.1';
      const lockTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes in the future
      const key = `${username}:${ip}`;

      service['lockedAccounts'] = new Map();
      service['lockedAccounts'].set(key, new Date()); // Lock now

      const result = service.isAccountLocked(username, ip);
      expect(result).toBe(true);
    });
  });

  describe('getRemainingLockTime', () => {
    it('should return 0 if account is not locked', () => {
      const result = service.getRemainingLockTime('testuser', '127.0.0.1');
      expect(result).toBe(0);
    });

    it('should return 0 if lock time has expired', () => {
      const username = 'testuser';
      const ip = '127.0.0.1';
      const key = `${username}:${ip}`;

      service['lockedAccounts'] = new Map();
      service['lockedAccounts'].set(key, new Date(Date.now() - 60 * 60 * 1000)); // 1 hour ago

      const result = service.getRemainingLockTime(username, ip);
      expect(result).toBe(0);
      expect(service['lockedAccounts'].has(key)).toBe(false); // Account should be unlocked
    });

    it('should return remaining lock time if account is currently locked', () => {
      const username = 'testuser';
      const ip = '127.0.0.1';
      const key = `${username}:${ip}`;

      service['lockedAccounts'] = new Map();
      service['lockedAccounts'].set(key, new Date()); // Lock now

      const result = service.getRemainingLockTime(username, ip);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(service['config'].lockoutDuration);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should return valid result for a strong password', () => {
      const result = service.validatePasswordStrength('Str0ngP@ssw0rd!');
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.score).toBeGreaterThan(80);
    });

    it('should return invalid result for a short password', () => {
      const result = service.validatePasswordStrength('a');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('密码长度至少需要8位');
    });

    it('should return invalid result for a password without uppercase', () => {
      const result = service.validatePasswordStrength('password123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个大写字母');
    });

    it('should return invalid result for a password without lowercase', () => {
      const result = service.validatePasswordStrength('PASSWORD123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个小写字母');
    });

    it('should return invalid result for a password without numbers', () => {
      const result = service.validatePasswordStrength('Password!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个数字');
    });

    it('should return invalid result for a password without special characters', () => {
      const result = service.validatePasswordStrength('Password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个特殊字符');
    });

    it('should return valid result for a password that meets all requirements', () => {
      const result = service.validatePasswordStrength('ValidPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('unlockAccount', () => {
    it('should unlock an account', () => {
      const username = 'testuser';
      const ip = '127.0.0.1';
      const key = `${username}:${ip}`;

      service['lockedAccounts'] = new Map();
      service['lockedAccounts'].set(key, new Date());

      service.unlockAccount(username, ip);

      expect(service['lockedAccounts'].has(key)).toBe(false);
    });

    it('should remove associated login attempts', () => {
      const username = 'testuser';
      const ip = '127.0.0.1';
      const key = `${username}:${ip}`;

      service['loginAttempts'] = new Map();
      service['loginAttempts'].set(key, [
        { username, ip, timestamp: new Date(), success: false },
      ]);

      service.unlockAccount(username, ip);

      expect(service['loginAttempts'].has(key)).toBe(false);
    });
  });

  describe('getLoginAttemptStats', () => {
    it('should return correct stats when no attempts exist', () => {
      const stats = service.getLoginAttemptStats();

      expect(stats.totalAttempts).toBe(0);
      expect(stats.successfulAttempts).toBe(0);
      expect(stats.failedAttempts).toBe(0);
      expect(stats.lockedAccounts).toBe(0);
      expect(stats.suspiciousAttempts).toBe(0);
    });

    it('should return correct stats with mixed attempts', () => {
      const username = 'testuser';
      const ip = '127.0.0.1';
      const key = `${username}:${ip}`;

      service['loginAttempts'] = new Map();
      service['loginAttempts'].set(key, [
        { username, ip, timestamp: new Date(), success: true },
        { username, ip, timestamp: new Date(), success: false },
        { username, ip, timestamp: new Date(), success: false },
      ]);

      service['lockedAccounts'] = new Map();
      service['lockedAccounts'].set('locked_key', new Date());

      const stats = service.getLoginAttemptStats();

      expect(stats.totalAttempts).toBe(3);
      expect(stats.successfulAttempts).toBe(1);
      expect(stats.failedAttempts).toBe(2);
      expect(stats.lockedAccounts).toBe(1);
    });

    it('should filter by username when provided', () => {
      const username1 = 'testuser1';
      const username2 = 'testuser2';
      const ip = '127.0.0.1';
      const key1 = `${username1}:${ip}`;
      const key2 = `${username2}:${ip}`;

      service['loginAttempts'] = new Map();
      service['loginAttempts'].set(key1, [
        { username: username1, ip, timestamp: new Date(), success: true },
      ]);
      service['loginAttempts'].set(key2, [
        { username: username2, ip, timestamp: new Date(), success: false },
      ]);

      const stats = service.getLoginAttemptStats(username1);

      expect(stats.totalAttempts).toBe(1);
      expect(stats.successfulAttempts).toBe(1);
      expect(stats.failedAttempts).toBe(0);
    });
  });

  describe('cleanupOldAttempts', () => {
    it('should clean up old login attempts', () => {
      const username = 'testuser';
      const ip = '127.0.0.1';
      const key = `${username}:${ip}`;

      // Add old attempts (1 hour ago)
      service['loginAttempts'] = new Map();
      service['loginAttempts'].set(key, [
        {
          username,
          ip,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          success: false,
        },
      ]);

      (service as any).cleanupOldAttempts();

      expect(service['loginAttempts'].has(key)).toBe(false);
    });

    it('should keep recent login attempts', () => {
      const username = 'testuser';
      const ip = '127.0.0.1';
      const key = `${username}:${ip}`;

      // Add recent attempts (30 minutes ago)
      service['loginAttempts'] = new Map();
      service['loginAttempts'].set(key, [
        {
          username,
          ip,
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          success: false,
        },
      ]);

      (service as any).cleanupOldAttempts();

      expect(service['loginAttempts'].has(key)).toBe(true);
      expect(service['loginAttempts'].get(key)!.length).toBe(1);
    });

    it('should clean up expired locked accounts', () => {
      const username = 'testuser';
      const ip = '127.0.0.1';
      const key = `${username}:${ip}`;

      service['lockedAccounts'] = new Map();
      service['lockedAccounts'].set(key, new Date(Date.now() - 60 * 60 * 1000)); // 1 hour ago

      (service as any).cleanupOldAttempts();

      expect(service['lockedAccounts'].has(key)).toBe(false);
    });

    it('should keep active locked accounts', () => {
      const username = 'testuser';
      const ip = '127.0.0.1';
      const key = `${username}:${ip}`;

      service['lockedAccounts'] = new Map();
      // Lock account for 30 minutes from now
      service['lockedAccounts'].set(key, new Date(Date.now()));

      (service as any).cleanupOldAttempts();

      expect(service['lockedAccounts'].has(key)).toBe(true);
    });
  });
});
