import { SetMetadata } from '@nestjs/common';

/**
 * 权限装饰器
 * 用于标记需要特定权限才能访问的接口
 * @param permissions 需要的权限列表
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

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

  // 角色管理权限
  ROLE_CREATE: 'role:create',
  ROLE_READ: 'role:read',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',

  // 权限管理权限
  PERMISSION_CREATE: 'permission:create',
  PERMISSION_READ: 'permission:read',
  PERMISSION_UPDATE: 'permission:update',
  PERMISSION_DELETE: 'permission:delete',

  // 系统管理权限
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOG: 'system:log',
} as const;
