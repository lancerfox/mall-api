import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services/user.service';
import { OperationLogService } from '../../log/services/operation-log.service';
import { SecurityService } from './security.service';
import * as bcrypt from 'bcrypt';
import { IUserWithoutPassword, ILoginResponse, IJwtPayload } from '../types';
import { UserInfoDto } from '../dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private operationLogService: OperationLogService,
    private securityService: SecurityService,
  ) {}

  /**
   * 验证用户凭据
   * @param username 用户名
   * @param password 明文密码
   * @param ip 客户端IP地址
   * @param userAgent 用户代理
   * @returns 验证成功返回用户信息（不含密码），失败返回null
   */
  async validateUser(
    username: string,
    password: string,
    ip?: string,
    userAgent?: string,
  ): Promise<IUserWithoutPassword | null> {
    // 检查账户是否被锁定
    if (ip && this.securityService.isAccountLocked(username, ip)) {
      const remainingTime = this.securityService.getRemainingLockTime(
        username,
        ip,
      );
      throw new UnauthorizedException(
        `账户已被锁定，请在 ${remainingTime} 分钟后重试`,
      );
    }

    const user = await this.userService.findOne(username);
    let isValid = false;

    if (user) {
      // 检查用户状态
      if (user.status === 'locked') {
        throw new UnauthorizedException('账户已被管理员锁定，请联系管理员');
      }

      if (user.status === 'inactive') {
        throw new UnauthorizedException('账户已被禁用，请联系管理员');
      }

      isValid = await bcrypt.compare(password, user.password);
    }

    // 记录登录尝试
    if (ip) {
      this.securityService.recordLoginAttempt(username, ip, isValid, userAgent);
    }

    if (user && isValid) {
      // 验证成功，返回用户信息（排除密码）
      const userObj = user.toObject() as Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = userObj;
      return result as unknown as IUserWithoutPassword;
    }

    return null;
  }

  /**
   * 用户登录
   * @param user 已验证的用户信息
   * @param ip 客户端IP地址
   * @param userAgent 用户代理
   * @returns 包含access_token和用户信息的对象
   */
  async login(
    user: IUserWithoutPassword,
    ip?: string,
    userAgent?: string,
  ): Promise<ILoginResponse> {
    // 更新用户最后登录时间和IP
    await this.userService.updateLastLogin(user._id, ip);

    // 生成访问令牌
    const accessTokenPayload: IJwtPayload = {
      username: user.username,
      sub: user._id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h'),
    });

    // 记录登录日志
    try {
      await this.operationLogService.logLogin(
        user._id,
        user.username,
        ip,
        userAgent,
      );
    } catch (error: unknown) {
      // 日志记录失败不应影响登录流程
      console.error('Failed to log login:', error);
    }

    // 获取更新后的用户信息
    const updatedUser = await this.userService.findById(user._id);
    if (!updatedUser) {
      throw new UnauthorizedException('用户不存在');
    }
    const userInfo = this.formatUserInfo(updatedUser);
    return {
      access_token: accessToken,
      user: userInfo,
      expires_in: this.parseExpiresIn(
        this.configService.get('JWT_EXPIRES_IN', '1h'),
      ),
    };
  }

  /**
   * 验证访问令牌
   * @param token 访问令牌
   * @returns JWT载荷
   */
  async validateToken(token: string): Promise<IJwtPayload> {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      console.log('validateToken error', error);
      throw new UnauthorizedException('访问令牌无效或已过期');
    }
  }

  /**
   * 格式化用户信息
   * @param user 用户实体
   * @returns 格式化后的用户信息
   */
  private formatUserInfo(user: IUserWithoutPassword): UserInfoDto {
    return {
      id: user._id,
      username: user.username,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      permissions: user.permissions,
      lastLoginTime: user.lastLoginTime,
      lastLoginIp: user.lastLoginIp,
    };
  }

  /**
   * 获取当前用户资料
   * @param userId 用户ID
   * @returns 用户资料信息
   */
  async getProfile(userId: string): Promise<UserInfoDto> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return this.formatUserInfo(user);
  }

  /**
   * 更新用户资料
   * @param userId 用户ID
   * @param updateData 更新数据
   * @param ip 客户端IP地址
   * @param userAgent 用户代理
   * @returns 更新后的用户信息
   */
  async updateProfile(
    userId: string,
    updateData: {
      avatar?: string;
    },
    ip?: string,
    userAgent?: string,
  ): Promise<UserInfoDto> {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      // 更新用户资料
      const updatedUser = await this.userService.updateProfile(
        userId,
        updateData,
      );

      // 记录操作日志
      try {
        await this.operationLogService.logProfileUpdate(
          userId,
          user.username,
          ip,
          userAgent,
          'success',
        );
      } catch (logError: unknown) {
        console.error('Failed to log profile update:', logError);
      }

      return this.formatUserInfo(updatedUser);
    } catch (error: unknown) {
      const user = await this.userService.findById(userId);

      // 记录操作失败日志
      try {
        await this.operationLogService.logProfileUpdate(
          userId,
          user?.username || 'unknown',
          ip,
          userAgent,
          'error',
          error instanceof Error ? error.message : '未知错误',
        );
      } catch (logError: unknown) {
        console.error('Failed to log profile update error:', logError);
      }

      throw error;
    }
  }

  /**
   * 修改密码
   * @param userId 用户ID
   * @param currentPassword 当前密码
   * @param newPassword 新密码
   * @param ip 客户端IP地址
   * @param userAgent 用户代理
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      // 验证密码强度
      const passwordValidation =
        this.securityService.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new BadRequestException({
          message: '密码强度不符合要求',
          errors: passwordValidation.errors,
          score: passwordValidation.score,
        });
      }

      // 验证当前密码
      const userWithPassword = await this.userService.findOne(user.username);
      if (
        !userWithPassword ||
        !(await bcrypt.compare(currentPassword, userWithPassword.password))
      ) {
        throw new UnauthorizedException('当前密码不正确');
      }

      // 检查新密码是否与当前密码相同
      if (await bcrypt.compare(newPassword, userWithPassword.password)) {
        throw new BadRequestException('新密码不能与当前密码相同');
      }

      // 更新密码
      await this.userService.updatePassword(userId, newPassword);

      // 记录操作日志
      try {
        await this.operationLogService.logPasswordChange(
          userId,
          user.username,
          ip,
          userAgent,
          'success',
        );
      } catch (logError: unknown) {
        console.error('Failed to log password change:', logError);
      }
    } catch (error: unknown) {
      const user = await this.userService.findById(userId);

      // 记录操作失败日志
      try {
        await this.operationLogService.logPasswordChange(
          userId,
          user?.username || 'unknown',
          ip,
          userAgent,
          'error',
          error instanceof Error ? error.message : '未知错误',
        );
      } catch (logError: unknown) {
        console.error('Failed to log password change error:', logError);
      }

      throw error;
    }
  }

  /**
   * 验证密码强度
   * @param password 密码
   * @returns 验证结果
   */
  validatePasswordStrength(password: string) {
    return this.securityService.validatePasswordStrength(password);
  }

  /**
   * 获取登录安全统计
   * @param username 用户名（可选）
   * @returns 安全统计信息
   */
  getSecurityStats(username?: string) {
    return this.securityService.getLoginAttemptStats(username);
  }

  /**
   * 手动解锁账户
   * @param username 用户名
   * @param ip IP地址
   */
  unlockAccount(username: string, ip: string) {
    this.securityService.unlockAccount(username, ip);
  }

  /**
   * 解析过期时间字符串为秒数
   * @param expiresIn 过期时间字符串（如 '1h', '30m', '7d'）
   * @returns 秒数
   */
  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 3600; // 默认1小时
    }
  }
}
