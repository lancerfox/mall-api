import { SetMetadata } from '@nestjs/common';

/**
 * 权限类型枚举
 */
export enum PermissionType {
  API = 'api',
  PAGE = 'page',
  OPERATION = 'operation',
}

/**
 * 模块类型枚举
 */
export enum ModuleType {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  SYSTEM = 'system',
}

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
 * 后端API权限常量
 */
export const API_PERMISSIONS = {
  // 用户管理API权限
  USER_CREATE: 'api:user:create',
  USER_READ: 'api:user:read',
  USER_UPDATE: 'api:user:update',
  USER_DELETE: 'api:user:delete',
  USER_RESET_PASSWORD: 'api:user:reset-password',
  USER_UPDATE_STATUS: 'api:user:update-status',

  // 权限管理API权限
  PERMISSION_CREATE: 'api:permission:create',
  PERMISSION_READ: 'api:permission:read',
  PERMISSION_UPDATE: 'api:permission:update',
  PERMISSION_DELETE: 'api:permission:delete',

  // 系统管理API权限
  SYSTEM_CONFIG: 'api:system:config',
  SYSTEM_LOG: 'api:system:log',
} as const;

/**
 * 前端页面权限常量
 */
export const PAGE_PERMISSIONS = {
  // 用户管理页面权限
  USER_MANAGEMENT: 'page:user:management',
  USER_DETAIL: 'page:user:detail',
  USER_CREATE_PAGE: 'page:user:create',

  // 权限管理页面权限
  PERMISSION_MANAGEMENT: 'page:permission:management',

  // 系统管理页面权限
  SYSTEM_MANAGEMENT: 'page:system:management',
} as const;

/**
 * 操作权限常量
 */
export const OPERATION_PERMISSIONS = {
  // 用户操作权限
  USER_EXPORT: 'operation:user:export',
  USER_IMPORT: 'operation:user:import',
  USER_BATCH_DELETE: 'operation:user:batch-delete',

  // 权限操作权限
  PERMISSION_ASSIGN: 'operation:permission:assign',
  PERMISSION_BATCH_UPDATE: 'operation:permission:batch-update',
} as const;

/**
 * 合并所有权限常量（向后兼容）
 */
export const PERMISSIONS = {
  ...API_PERMISSIONS,
  ...PAGE_PERMISSIONS,
  ...OPERATION_PERMISSIONS,
} as const;
