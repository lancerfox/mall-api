import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../modules/user/services/user.service';
import type { Request } from 'express';

interface JwtUser {
  username: string;
  sub: string;
  role: string;
}

interface RequestWithUser extends Request {
  user: JwtUser;
  fullUser?: {
    id: string;
    username: string;
    role: string;
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
      throw new ForbiddenException('用户信息不存在');
    }

    // 获取最新的用户信息，确保权限是最新的
    const user = await this.userService.findById(jwtUser.sub);
    if (!user) {
      throw new ForbiddenException('用户不存在');
    }

    if (user.status !== 'active') {
      throw new ForbiddenException('用户账户已被禁用');
    }

    // 检查角色权限
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = this.checkRoles(user.role, requiredRoles);
      if (!hasRole) {
        throw new ForbiddenException('用户角色权限不足');
      }
    }

    // 检查具体权限
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = this.checkPermissions(
        user.permissions,
        requiredPermissions,
      );
      if (!hasPermission) {
        throw new ForbiddenException('用户权限不足');
      }
    }

    // 将完整的用户信息添加到请求对象中，供后续使用
    request.fullUser = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      permissions: user.permissions || [],
    };

    return true;
  }

  /**
   * 检查用户角色是否满足要求
   * @param userRole 用户角色
   * @param requiredRoles 需要的角色列表
   * @returns 是否有权限
   */
  private checkRoles(userRole: string, requiredRoles: string[]): boolean {
    // 超级管理员拥有所有权限
    if (userRole === 'super_admin') {
      return true;
    }

    // 检查用户角色是否在要求的角色列表中
    return requiredRoles.includes(userRole);
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
