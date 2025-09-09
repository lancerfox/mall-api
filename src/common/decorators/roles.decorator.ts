import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../enums/role-type.enum';

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
  MENU = 'menu',
}

/**
 * 角色装饰器
 * 用于标记需要特定角色才能访问的接口
 * @param roles 允许访问的角色列表
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * 预定义的角色常量（向后兼容）
 */
export const ROLES = {
  SUPER_ADMIN: RoleType.SUPER_ADMIN,
  ADMIN: RoleType.ADMIN,
  OPERATOR: RoleType.OPERATOR,
} as const;
