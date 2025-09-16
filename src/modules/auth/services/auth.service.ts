import {
  Injectable,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services/user.service';
import { SecurityService } from './security.service';
import * as bcrypt from 'bcrypt';
import { IUserWithoutPassword, ILoginResponse, IJwtPayload } from '../types';
import { UserInfoDto } from '../dto/auth-response.dto';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { ERROR_CODES } from '../../../common/constants/error-codes';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
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
      throw new HttpException(
        `账户已被锁定，请在 ${remainingTime} 分钟后重试`,
        ERROR_CODES.ACCOUNT_LOCKED,
      );
    }

    const user = await this.userService.findOne(username);
    let isValid = false;

    if (user) {
      // 检查用户状态
      if (user.status === 'locked') {
        throw new HttpException(
          '账户已被管理员锁定，请联系管理员',
          ERROR_CODES.ACCOUNT_LOCKED,
        );
      }

      if (user.status === 'inactive') {
        throw new HttpException(
          '账户已被禁用，请联系管理员',
          ERROR_CODES.ACCOUNT_DISABLED,
        );
      }

      isValid = await bcrypt.compare(password, user.password);
    }

    // 记录登录尝试
    if (ip) {
      this.securityService.recordLoginAttempt(username, ip, isValid, userAgent);
    }

    if (user && isValid) {
      // 验证成功，返回用户信息（排除密码）
      const userObj = user.toObject?.() ?? user;
      const { password, ...result } = userObj as Record<string, unknown>;

      // 确保返回的对象包含正确的id字段
      const typedResult = result as Record<string, unknown>;
      const resultWithId = {
        ...result,
        id: typedResult._id
          ? String(typedResult._id)
          : typedResult.id
            ? String(typedResult.id)
            : '',
      };

      return resultWithId as IUserWithoutPassword;
    }

    return null;
  }

  /**
   * 用户登录
   * @param user 已验证的用户信息
   * @param ip 客户端IP地址
   * @param userAgent 用户代理
   * @returns 包含access_token的对象
   */
  async login(
    user: IUserWithoutPassword,
    ip?: string,
    userAgent?: string,
  ): Promise<ILoginResponse> {
    // 使用username作为备用标识符，如果id不存在
    let userId = user.id;

    if (!userId) {
      const foundUser = await this.userService.findOne(user.username);
      if (!foundUser) {
        throw new HttpException('用户不存在', ERROR_CODES.USER_NOT_FOUND);
      }
      const foundUserId = foundUser._id?.toString();
      if (!foundUserId) {
        throw new HttpException('无法确定用户ID', ERROR_CODES.USER_ID_UNDEFINED);
      }
      userId = foundUserId;
    }

    if (!userId) {
      throw new HttpException(
        '无法确定用户ID',
        ERROR_CODES.INVALID_USER_ID,
      );
    }

    await this.userService.updateLastLogin(userId, ip);

    // 生成访问令牌
    const accessTokenPayload: IJwtPayload = {
      username: user.username,
      sub: userId,
      role: user.roles && user.roles.length > 0 ? user.roles[0].name : '',
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h'),
    });

    return {
      access_token: accessToken,
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
      throw new HttpException(
        '访问令牌无效或已过期',
        ERROR_CODES.INVALID_TOKEN,
      );
    }
  }

  /**
   * 格式化用户信息
   * @param user 用户实体
   * @returns 格式化后的用户信息
   */
  private formatUserInfo(user: UserResponseDto): UserInfoDto {
    return {
      id: user.id,
      username: user.username,
      roles: user.roles,
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
      throw new HttpException(
        '用户不存在',
        ERROR_CODES.USER_NOT_FOUND,
      );
    }

    return this.formatUserInfo(user);
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
        throw new HttpException(
          '用户不存在',
          ERROR_CODES.USER_NOT_FOUND,
        );
      }

      // 验证当前密码
      const userWithPassword = await this.userService.findOne(user.username);
      if (
        !userWithPassword ||
        !(await bcrypt.compare(currentPassword, userWithPassword.password))
      ) {
        throw new HttpException(
          '当前密码不正确',
          ERROR_CODES.INVALID_PASSWORD,
        );
      }

      // 检查新密码是否与当前密码相同
      if (await bcrypt.compare(newPassword, userWithPassword.password)) {
        throw new HttpException(
          '新密码不能与当前密码相同',
          ERROR_CODES.PASSWORD_SAME_AS_CURRENT,
        );
      }

      // 更新密码
      await this.userService.updatePassword(userId, newPassword);
    } catch (error: unknown) {
      console.log(error);
      throw error;
    }
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
   * 重置用户密码
   * @param id 用户ID
   * @returns 新生成的密码
   */
  async resetPassword(id: string): Promise<string> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new HttpException(
        '用户不存在',
        ERROR_CODES.USER_NOT_FOUND,
      );
    }

    // 检查用户状态
    if (user.status === 'locked') {
      throw new HttpException(
        '账户已被锁定，无法重置密码',
        ERROR_CODES.ACCOUNT_LOCKED,
      );
    }

    if (user.status === 'inactive') {
      throw new HttpException(
        '账户已被禁用，无法重置密码',
        ERROR_CODES.ACCOUNT_DISABLED,
      );
    }

    // 生成随机密码
    const newPassword = this.userService.generateRandomPassword(10);

    // 更新密码
    await this.userService.updatePassword(user.id, newPassword);

    return newPassword;
  }

  /**
   * 解析过期时间字符串为秒数
   * @param expiresIn 过期时间字符串（如 '1h', '30m', '7d'）
   * @returns 秒数
   */
  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    // 处理无效输入
    if (isNaN(value)) {
      return 3600; // 默认1小时
    }

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
