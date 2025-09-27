/**
 * 用户实体接口（不包含密码）
 * 用于认证服务中返回的用户信息
 */
export interface IUserWithoutPassword {
  id: string;
  username: string;
  roles: { id: string; name: string }[];
  status: string;
  avatar?: string;
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
  expires_in: number;
}

/**
 * 认证服务相关类型导出
 */
export type AuthServiceTypes = {
  UserWithoutPassword: IUserWithoutPassword;
  JwtPayload: IJwtPayload;
  LoginResponse: ILoginResponse;
};
