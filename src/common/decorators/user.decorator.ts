import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface FullUser {
  id: string;
  username: string;
  role: string;
  permissions: string[];
}

export interface JwtUser {
  username: string;
  sub: string;
  role: string;
}

/**
 * 当前用户装饰器
 * 用于在控制器方法中获取当前认证用户的信息
 */
export const CurrentUser = createParamDecorator(
  (
    data: keyof FullUser | keyof JwtUser | undefined,
    ctx: ExecutionContext,
  ): any => {
    const request = ctx.switchToHttp().getRequest();
    const user: FullUser | JwtUser = request.fullUser || request.user;

    // 如果指定了特定字段，则返回该字段的值
    if (data && user) {
      // 使用类型断言来处理联合类型的索引访问
      if ('id' in user && data === 'id') {
        return user.id;
      }
      if ('sub' in user && data === 'sub') {
        return user.sub;
      }
      if (data === 'username' || data === 'role') {
        return user[data];
      }
      if ('permissions' in user && data === 'permissions') {
        return user.permissions;
      }
    }
    return user;
  },
);
