import { SetMetadata } from '@nestjs/common';

/**
 * 权限装饰器
 * 用于标记需要特定权限才能访问的接口
 * @param permissions 需要的权限列表
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

/**
 * 后端API权限常量
 */
export const API_PERMISSIONS = {
  // 用户管理API权限
  USER_CREATE: 'api:user:create',
  USER_READ: 'api:user:list',
  USER_UPDATE: 'api:user:update',
  USER_DELETE: 'api:user:delete',
  USER_RESET_PASSWORD: 'api:user:reset-password',
  USER_UPDATE_STATUS: 'api:user:update-status',

  // 权限管理API权限
  PERMISSION_CREATE: 'permission:create',
  PERMISSION_READ: 'permission:list',
  PERMISSION_UPDATE: 'permission:update',
  PERMISSION_DELETE: 'permission:delete',

  // 角色管理API权限
  ROLE_CREATE: 'role:create',
  ROLE_READ: 'role:list',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  ROLE_PERMISSIONS: 'role:permissions',
} as const;

/**
 * 前端页面权限常量
 */
export const PAGE_PERMISSIONS = {
  // 用户管理页面权限
  // USER_MANAGEMENT: 'page:user:management',
  // USER_DETAIL: 'page:user:detail',
  // USER_CREATE_PAGE: 'page:user:create',
  // 权限管理页面权限
  // PERMISSION_MANAGEMENT: 'page:permission:management',
  // 系统管理页面权限
  // SYSTEM_MANAGEMENT: 'page:system:management',
} as const;

/**
 * 操作权限常量
 */
export const OPERATION_PERMISSIONS = {
  // 用户操作权限
  // USER_EXPORT: 'operation:user:export',
  // USER_IMPORT: 'operation:user:import',
  // USER_BATCH_DELETE: 'operation:user:batch-delete',
  // 权限操作权限
  // PERMISSION_ASSIGN: 'operation:permission:assign',
  // PERMISSION_BATCH_UPDATE: 'operation:permission:batch-update',
} as const;

/**
 * 合并所有权限常量（向后兼容）
 */
export const PERMISSIONS = {
  ...API_PERMISSIONS,
  ...PAGE_PERMISSIONS,
  ...OPERATION_PERMISSIONS,
} as const;
