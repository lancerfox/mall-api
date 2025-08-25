import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../user/entities/user.entity';
import { OperationLogService } from '../../log/services/operation-log.service';

interface LoginAttempt {
  username: string;
  ip: string;
  timestamp: Date;
  success: boolean;
  userAgent?: string;
}

interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  suspiciousLoginThreshold: number; // different IPs in time window
  suspiciousTimeWindow: number; // in hours
}

@Injectable()
export class SecurityService {
  private loginAttempts: Map<string, LoginAttempt[]> = new Map();
  private lockedAccounts: Map<string, Date> = new Map();

  private readonly config: SecurityConfig = {
    maxLoginAttempts: 5,
    lockoutDuration: 30, // 30 minutes
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    suspiciousLoginThreshold: 3,
    suspiciousTimeWindow: 24, // 24 hours
  };

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private operationLogService: OperationLogService,
  ) {
    // Clean up old login attempts every hour
    setInterval(() => this.cleanupOldAttempts(), 60 * 60 * 1000);
  }

  /**
   * 记录登录尝试
   * @param username 用户名
   * @param ip IP地址
   * @param success 是否成功
   * @param userAgent 用户代理
   */
  recordLoginAttempt(
    username: string,
    ip: string,
    success: boolean,
    userAgent?: string,
  ) {
    const attempt: LoginAttempt = {
      username,
      ip,
      timestamp: new Date(),
      success,
      userAgent,
    };

    const key = `${username}:${ip}`;
    const attempts = this.loginAttempts.get(key) || [];
    attempts.push(attempt);

    // 只保留最近1小时的尝试记录
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAttempts = attempts.filter((a) => a.timestamp > oneHourAgo);

    this.loginAttempts.set(key, recentAttempts);

    // 如果登录失败，检查是否需要锁定账户
    if (!success) {
      this.checkAndLockAccount(username, ip);
    }

    // 检查是否存在可疑登录行为
    if (success) {
      // this.checkSuspiciousLogin(username, ip, userAgent);
    }
  }

  /**
   * 检查账户是否被锁定
   * @param username 用户名
   * @param ip IP地址
   * @returns 是否被锁定
   */
  isAccountLocked(username: string, ip: string): boolean {
    const key = `${username}:${ip}`;
    const lockTime = this.lockedAccounts.get(key);

    if (!lockTime) {
      return false;
    }

    const now = new Date();
    const unlockTime = new Date(
      lockTime.getTime() + this.config.lockoutDuration * 60 * 1000,
    );

    if (now > unlockTime) {
      // 锁定时间已过，解除锁定
      this.lockedAccounts.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 获取账户剩余锁定时间（分钟）
   * @param username 用户名
   * @param ip IP地址
   * @returns 剩余锁定时间
   */
  getRemainingLockTime(username: string, ip: string): number {
    const key = `${username}:${ip}`;
    const lockTime = this.lockedAccounts.get(key);

    if (!lockTime) {
      return 0;
    }

    const now = new Date();
    const unlockTime = new Date(
      lockTime.getTime() + this.config.lockoutDuration * 60 * 1000,
    );

    if (now > unlockTime) {
      this.lockedAccounts.delete(key);
      return 0;
    }

    return Math.ceil((unlockTime.getTime() - now.getTime()) / (60 * 1000));
  }

  /**
   * 验证密码强度
   * @param password 密码
   * @returns 验证结果
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    score: number;
  } {
    const errors: string[] = [];
    let score = 0;

    // 长度检查
    if (password.length < this.config.passwordMinLength) {
      errors.push(`密码长度至少需要${this.config.passwordMinLength}位`);
    } else {
      score += 20;
    }

    // 大写字母检查
    if (this.config.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errors.push('密码必须包含至少一个大写字母');
    } else if (/[A-Z]/.test(password)) {
      score += 20;
    }

    // 小写字母检查
    if (this.config.passwordRequireLowercase && !/[a-z]/.test(password)) {
      errors.push('密码必须包含至少一个小写字母');
    } else if (/[a-z]/.test(password)) {
      score += 20;
    }

    // 数字检查
    if (this.config.passwordRequireNumbers && !/\d/.test(password)) {
      errors.push('密码必须包含至少一个数字');
    } else if (/\d/.test(password)) {
      score += 20;
    }

    // 特殊字符检查
    if (
      this.config.passwordRequireSpecialChars &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      errors.push('密码必须包含至少一个特殊字符');
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 20;
    }

    // 额外的复杂度检查
    if (password.length >= 12) score += 10;
    if (/[A-Z].*[A-Z]/.test(password)) score += 5;
    if (/[a-z].*[a-z]/.test(password)) score += 5;
    if (/\d.*\d/.test(password)) score += 5;
    if (/[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]/.test(password))
      score += 5;

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(score, 100),
    };
  }

  /**
   * 手动解锁账户
   * @param username 用户名
   * @param ip IP地址
   */
  unlockAccount(username: string, ip: string) {
    const key = `${username}:${ip}`;
    this.lockedAccounts.delete(key);
    this.loginAttempts.delete(key);
  }

  /**
   * 获取登录尝试统计
   * @param username 用户名
   * @returns 统计信息
   */
  getLoginAttemptStats(username?: string) {
    const stats = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      lockedAccounts: 0,
      suspiciousAttempts: 0,
    };

    for (const [key, attempts] of this.loginAttempts.entries()) {
      if (username && !key.startsWith(`${username}:`)) {
        continue;
      }

      stats.totalAttempts += attempts.length;
      stats.successfulAttempts += attempts.filter((a) => a.success).length;
      stats.failedAttempts += attempts.filter((a) => !a.success).length;
    }

    stats.lockedAccounts = this.lockedAccounts.size;

    return stats;
  }

  /**
   * 检查并锁定账户
   * @param username 用户名
   * @param ip IP地址
   */
  private checkAndLockAccount(username: string, ip: string) {
    const key = `${username}:${ip}`;
    const attempts = this.loginAttempts.get(key) || [];

    // 计算最近的失败尝试次数
    const recentFailures = attempts.filter((a) => !a.success).length;

    if (recentFailures >= this.config.maxLoginAttempts) {
      this.lockedAccounts.set(key, new Date());

      // 记录账户锁定日志
      // this.operationLogService.create({
      //   userId: 'system',
      //   username: 'system',
      //   action: 'account_locked',
      //   module: 'security',
      //   description: `账户 ${username} 因多次登录失败被锁定`,
      //   ip,
      //   status: 'success',
      //   method: 'SYSTEM',
      //   url: '/security/lock',
      //   requestData: { username, failureCount: recentFailures },
      // });
    }
  }

  /**
   * 检查可疑登录行为
   * @param username 用户名
   * @param ip IP地址
   * @param userAgent 用户代理
   */
  private async checkSuspiciousLogin(
    username: string,
    ip: string,
    userAgent?: string,
  ) {
    try {
      // 检查最近24小时内的登录IP数量
      const timeWindow = new Date(
        Date.now() - this.config.suspiciousTimeWindow * 60 * 60 * 1000,
      );

      // const recentLogins = await this.operationLogService.create({
      //   userId: 'system',
      //   username: 'system',
      //   action: 'check_suspicious_login',
      //   module: 'security',
      //   description: `检查用户 ${username} 的可疑登录行为`,
      //   ip,
      //   userAgent,
      //   status: 'success',
      //   method: 'SYSTEM',
      //   url: '/security/check',
      // });

      // 这里可以添加更复杂的异常检测逻辑
      // 比如：
      // 1. 检查地理位置变化
      // 2. 检查设备指纹变化
      // 3. 检查登录时间模式
      // 4. 检查用户行为模式

      // 简单的IP变化检测示例
      const uniqueIPs = new Set();
      for (const [key, attempts] of this.loginAttempts.entries()) {
        if (key.startsWith(`${username}:`)) {
          attempts.forEach((attempt) => {
            if (attempt.success && attempt.timestamp > timeWindow) {
              uniqueIPs.add(attempt.ip);
            }
          });
        }
      }

      if (uniqueIPs.size >= this.config.suspiciousLoginThreshold) {
        // 记录可疑登录警告
        await this.operationLogService.create({
          userId: 'system',
          username: 'system',
          action: 'suspicious_login_detected',
          module: 'security',
          description: `检测到用户 ${username} 存在可疑登录行为：${uniqueIPs.size} 个不同IP地址`,
          ip,
          userAgent,
          status: 'success',
          method: 'SYSTEM',
          url: '/security/alert',
          requestData: {
            username,
            uniqueIPCount: uniqueIPs.size,
            ips: Array.from(uniqueIPs),
          },
        });
      }
    } catch (error) {
      console.error('检查可疑登录行为时出错:', error);
    }
  }

  /**
   * 清理过期的登录尝试记录
   */
  private cleanupOldAttempts() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const [key, attempts] of this.loginAttempts.entries()) {
      const recentAttempts = attempts.filter((a) => a.timestamp > oneHourAgo);

      if (recentAttempts.length === 0) {
        this.loginAttempts.delete(key);
      } else {
        this.loginAttempts.set(key, recentAttempts);
      }
    }

    // 清理过期的锁定账户
    const now = new Date();
    for (const [key, lockTime] of this.lockedAccounts.entries()) {
      const unlockTime = new Date(
        lockTime.getTime() + this.config.lockoutDuration * 60 * 1000,
      );
      if (now > unlockTime) {
        this.lockedAccounts.delete(key);
      }
    }
  }
}
