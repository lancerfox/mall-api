import { Test, TestingModule } from '@nestjs/testing';
import { SecurityService } from '../services/security.service';

describe('SecurityService', () => {
  let securityService: SecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityService],
    }).compile();

    securityService = module.get<SecurityService>(SecurityService);

    // 清除所有状态
    (securityService as any).loginAttempts.clear();
    (securityService as any).lockedAccounts.clear();
  });

  describe('recordLoginAttempt', () => {
    it('应该记录登录尝试', () => {
      // 执行
      securityService.recordLoginAttempt('testuser', '192.168.1.1', true);
      securityService.recordLoginAttempt('testuser', '192.168.1.1', false);

      // 断言
      const attempts = (securityService as any).loginAttempts.get(
        'testuser:192.168.1.1',
      );
      expect(attempts).toHaveLength(2);
      expect(attempts[0].success).toBe(true);
      expect(attempts[1].success).toBe(false);
    });

    it('应该只保留最近1小时的尝试记录', () => {
      // 安排 - 创建一个过期的尝试
      const oldAttempt = {
        username: 'testuser',
        ip: '192.168.1.1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
        success: true,
      };

      const attempts = [oldAttempt];
      (securityService as any).loginAttempts.set(
        'testuser:192.168.1.1',
        attempts,
      );

      // 执行 - 添加一个新的尝试
      securityService.recordLoginAttempt('testuser', '192.168.1.1', false);

      // 断言 - 应该只保留新的尝试
      const updatedAttempts = (securityService as any).loginAttempts.get(
        'testuser:192.168.1.1',
      );
      expect(updatedAttempts).toHaveLength(1);
      expect(updatedAttempts[0].success).toBe(false);
    });
  });

  describe('isAccountLocked', () => {
    it('应该在账户未锁定时返回false', () => {
      // 执行和断言
      expect(securityService.isAccountLocked('testuser', '192.168.1.1')).toBe(
        false,
      );
    });

    it('应该在账户锁定时返回true', () => {
      // 安排
      (securityService as any).lockedAccounts.set(
        'testuser:192.168.1.1',
        new Date(),
      );

      // 执行和断言
      expect(securityService.isAccountLocked('testuser', '192.168.1.1')).toBe(
        true,
      );
    });

    it('应该在锁定时间过后返回false', () => {
      // 安排 - 设置一个过期的锁定时间
      const lockTime = new Date(Date.now() - 31 * 60 * 1000); // 31分钟前
      (securityService as any).lockedAccounts.set(
        'testuser:192.168.1.1',
        lockTime,
      );

      // 执行和断言
      expect(securityService.isAccountLocked('testuser', '192.168.1.1')).toBe(
        false,
      );
    });
  });

  describe('getRemainingLockTime', () => {
    it('应该在账户未锁定时返回0', () => {
      // 执行和断言
      expect(
        securityService.getRemainingLockTime('testuser', '192.168.1.1'),
      ).toBe(0);
    });

    it('应该正确计算剩余锁定时间', () => {
      // 安排 - 设置一个15分钟前的锁定时间
      const lockTime = new Date(Date.now() - 15 * 60 * 1000); // 15分钟前
      (securityService as any).lockedAccounts.set(
        'testuser:192.168.1.1',
        lockTime,
      );

      // 执行和断言 - 应该剩余15分钟
      const remainingTime = securityService.getRemainingLockTime(
        'testuser',
        '192.168.1.1',
      );
      expect(remainingTime).toBeGreaterThan(14);
      expect(remainingTime).toBeLessThanOrEqual(15);
    });
  });

  describe('validatePasswordStrength', () => {
    it('应该验证强密码', () => {
      // 执行
      const result = securityService.validatePasswordStrength('StrongPass123!');

      // 断言
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(80);
    });

    it('应该检测弱密码', () => {
      // 执行
      const result = securityService.validatePasswordStrength('weak');

      // 断言
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码长度至少需要8位');
      expect(result.score).toBeLessThan(50);
    });

    it('应该检测缺少大写字母', () => {
      // 执行
      const result = securityService.validatePasswordStrength('lowercase123!');

      // 断言
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个大写字母');
    });

    it('应该检测缺少小写字母', () => {
      // 执行
      const result = securityService.validatePasswordStrength('UPPERCASE123!');

      // 断言
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个小写字母');
    });

    it('应该检测缺少数字', () => {
      // 执行
      const result = securityService.validatePasswordStrength('NoNumbers!');

      // 断言
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个数字');
    });

    it('应该检测缺少特殊字符', () => {
      // 执行
      const result =
        securityService.validatePasswordStrength('NoSpecialChars123');

      // 断言
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个特殊字符');
    });
  });

  describe('unlockAccount', () => {
    it('应该解锁账户', () => {
      // 安排
      (securityService as any).lockedAccounts.set(
        'testuser:192.168.1.1',
        new Date(),
      );
      (securityService as any).loginAttempts.set('testuser:192.168.1.1', [
        {
          username: 'testuser',
          ip: '192.168.1.1',
          timestamp: new Date(),
          success: false,
        },
      ]);

      // 执行
      securityService.unlockAccount('testuser', '192.168.1.1');

      // 断言
      expect(
        (securityService as any).lockedAccounts.has('testuser:192.168.1.1'),
      ).toBe(false);
      expect(
        (securityService as any).loginAttempts.has('testuser:192.168.1.1'),
      ).toBe(false);
    });
  });

  describe('getLoginAttemptStats', () => {
    it('应该返回正确的统计信息', () => {
      // 安排
      securityService.recordLoginAttempt('testuser', '192.168.1.1', true);
      securityService.recordLoginAttempt('testuser', '192.168.1.1', false);
      securityService.recordLoginAttempt('testuser', '192.168.1.1', false);
      securityService.recordLoginAttempt('otheruser', '192.168.1.2', true);

      // 锁定一个账户
      (securityService as any).lockedAccounts.set(
        'lockeduser:192.168.1.3',
        new Date(),
      );

      // 执行
      const stats = securityService.getLoginAttemptStats();

      // 断言
      expect(stats.totalAttempts).toBe(4);
      expect(stats.successfulAttempts).toBe(2);
      expect(stats.failedAttempts).toBe(2);
      expect(stats.lockedAccounts).toBe(1);
    });

    it('应该按用户名过滤统计信息', () => {
      // 安排
      securityService.recordLoginAttempt('testuser', '192.168.1.1', true);
      securityService.recordLoginAttempt('testuser', '192.168.1.1', false);
      securityService.recordLoginAttempt('otheruser', '192.168.1.2', true);

      // 执行
      const stats = securityService.getLoginAttemptStats('testuser');

      // 断言
      expect(stats.totalAttempts).toBe(2);
      expect(stats.successfulAttempts).toBe(1);
      expect(stats.failedAttempts).toBe(1);
    });
  });

  describe('checkAndLockAccount', () => {
    it('应该在达到最大失败尝试次数时锁定账户', () => {
      // 安排 - 模拟5次失败尝试
      for (let i = 0; i < 5; i++) {
        securityService.recordLoginAttempt('testuser', '192.168.1.1', false);
      }

      // 断言
      expect(securityService.isAccountLocked('testuser', '192.168.1.1')).toBe(
        true,
      );
    });

    it('不应该在失败尝试次数不足时锁定账户', () => {
      // 安排 - 模拟4次失败尝试（少于最大尝试次数）
      for (let i = 0; i < 4; i++) {
        securityService.recordLoginAttempt('testuser', '192.168.1.1', false);
      }

      // 断言
      expect(securityService.isAccountLocked('testuser', '192.168.1.1')).toBe(
        false,
      );
    });
  });

  describe('cleanupOldAttempts', () => {
    it('应该清理过期的登录尝试记录', () => {
      // 安排 - 添加一个过期的尝试
      const oldAttempt = {
        username: 'testuser',
        ip: '192.168.1.1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
        success: true,
      };

      (securityService as any).loginAttempts.set('testuser:192.168.1.1', [
        oldAttempt,
      ]);

      // 执行 - 手动调用清理方法
      (securityService as any).cleanupOldAttempts();

      // 断言 - 过期的尝试应该被清理
      expect(
        (securityService as any).loginAttempts.has('testuser:192.168.1.1'),
      ).toBe(false);
    });

    it('应该清理过期的锁定账户', () => {
      // 安排 - 设置一个过期的锁定时间
      const lockTime = new Date(Date.now() - 31 * 60 * 1000); // 31分钟前
      (securityService as any).lockedAccounts.set(
        'testuser:192.168.1.1',
        lockTime,
      );

      // 执行 - 手动调用清理方法
      (securityService as any).cleanupOldAttempts();

      // 断言 - 过期的锁定应该被清理
      expect(
        (securityService as any).lockedAccounts.has('testuser:192.168.1.1'),
      ).toBe(false);
    });
  });
});
