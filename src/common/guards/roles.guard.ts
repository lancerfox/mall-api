import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../modules/user/services/user.service';
import { RoleType } from '../../common/enums/role-type.enum';
import type { Request } from 'express';
import { BusinessException } from '../exceptions/business.exception';
import { ERROR_CODES } from '../constants/error-codes';

interface JwtUser {
  username: string;
  sub: string;
}

interface RequestWithUser extends Request {
  user: JwtUser;
  fullUser?: {
    id: string;
    username: string;
    roles: string[];
    permissions: string[];
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取方法和类级别的角色要求
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // 获取方法和类级别的权限要求
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    // 如果没有设置角色或权限要求，则允许访问
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const jwtUser = request.user;

    if (!jwtUser) {
      throw new BusinessException(ERROR_CODES.AUTH_USER_INFO_MISSING);
    }

    // 获取最新的用户信息，确保权限是最新的
    const user = await this.userService.findById(jwtUser.sub);
    if (!user) {
      throw new BusinessException(ERROR_CODES.USER_NOT_FOUND);
    }

    if (user.status !== 'active') {
      throw new BusinessException(ERROR_CODES.ACCOUNT_DISABLED);
    }

    // 获取用户的完整信息（包含角色和权限）
    const userDoc = await this.userService.findOne(user.username);
    if (!userDoc) {
      throw new BusinessException(ERROR_CODES.USER_INFO_RETRIEVAL_FAILED);
    }

    // 获取用户所有权限
    const userPermissions = this.userService.getUserPermissions(userDoc);

    // 获取用户角色名称
    const userRoles = (userDoc.roles as { name: string }[]).map(
      (role) => role.name,
    );

    // 如果是超级管理员，直接拥有所有权限
    if (userRoles.includes(RoleType.SUPER_ADMIN)) {
      return true;
    }

    // 检查角色权限
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = this.checkRoles(userRoles, requiredRoles);
      if (!hasRole) {
        throw new BusinessException(ERROR_CODES.PERMISSION_ROLE_INSUFFICIENT);
      }
    }

    // 检查具体权限
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = this.checkPermissions(
        userPermissions,
        requiredPermissions,
      );
      if (!hasPermission) {
        throw new BusinessException(ERROR_CODES.PERMISSION_INSUFFICIENT);
      }
    }

    // 将完整的用户信息添加到请求对象中，供后续使用
    request.fullUser = {
      id: user.id.toString(),
      username: user.username,
      roles: userRoles,
      permissions: userPermissions,
    };

    return true;
  }

  /**
   * 检查用户角色是否满足要求
   * @param userRoles 用户角色列表
   * @param requiredRoles 需要的角色列表
   * @returns 是否有权限
   */
  private checkRoles(userRoles: string[], requiredRoles: string[]): boolean {
    // 超级管理员拥有所有权限
    if (userRoles.includes(RoleType.SUPER_ADMIN)) {
      return true;
    }

    // 检查用户是否拥有任一要求的角色
    return requiredRoles.some((role) => userRoles.includes(role));
  }

  /**
   * 检查用户权限是否满足要求
   * @param userPermissions 用户权限列表
   * @param requiredPermissions 需要的权限列表
   * @returns 是否有权限
   */
  private checkPermissions(
    userPermissions: string[],
    requiredPermissions: string[],
  ): boolean {
    // 检查用户是否拥有所有必需的权限
    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
