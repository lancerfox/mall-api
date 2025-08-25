import { Document } from 'mongoose';

/**
 * 用户实体接口（不包含密码）
 * 用于认证服务中返回的用户信息
 */
export interface IUserWithoutPassword {
  _id: string;
  username: string;
  email: string;
  realName: string;
  role: string;
  status: string;
  avatar?: string;
  phone?: string;
  permissions: string[];
  lastLoginTime?: Date;
  lastLoginIp?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * JWT载荷接口
 * 定义JWT token中包含的用户信息
 */
export interface IJwtPayload {
  username: string;
  sub: string; // 用户ID
  role: string;
  iat?: number; // 签发时间
  exp?: number; // 过期时间
}

/**
 * 登录响应接口
 * 定义登录成功后返回的数据结构
 */
export interface ILoginResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    realName: string;
    role: string;
    status: string;
    avatar?: string;
    phone?: string;
    permissions: string[];
    lastLoginTime?: Date;
    lastLoginIp?: string;
  };
  expires_in: number;
}

/**
 * 用户文档接口
 * 扩展Mongoose Document，包含用户实体的所有字段
 */
export interface IUserDocument extends Document {
  _id: string;
  username: string;
  password: string;
  email?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  toObject(): any;
}

/**
 * 认证服务相关类型导出
 */
export type AuthServiceTypes = {
  UserWithoutPassword: IUserWithoutPassword;
  JwtPayload: IJwtPayload;
  LoginResponse: ILoginResponse;
  UserDocument: IUserDocument;
};
