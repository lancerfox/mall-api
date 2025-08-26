import { SetMetadata } from '@nestjs/common';

/**
 * 角色装饰器
 * 用于标记需要特定角色才能访问的接口
 * @param roles 允许访问的角色列表
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * 权限装饰器
 * 用于标记需要特定权限才能访问的接口
 * @param permissions 需要的权限列表
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

/**
 * 公开接口装饰器
 * 用于标记不需要认证的公开接口
 */
export const Public = () => SetMetadata('isPublic', true);

/**
 * 预定义的角色常量
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  OPERATOR: 'operator',
} as const;

/**
 * 预定义的权限常量
 */
export const PERMISSIONS = {
  // 用户管理权限
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_RESET_PASSWORD: 'user:reset-password',
  USER_UPDATE_STATUS: 'user:update-status',

  // 菜单管理权限
  // MENU_CREATE: 'menu:create',
  // MENU_READ: 'menu:read',
  // MENU_UPDATE: 'menu:update',
  // MENU_DELETE: 'menu:delete',
  // MENU_SORT: 'menu:sort',

  // 系统管理权限
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOG: 'system:log',

  // 权限管理
  PERMISSION_ASSIGN: 'permission:assign',
  PERMISSION_VIEW: 'permission:view',
} as const;
