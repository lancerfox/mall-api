import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  override handleRequest(err: Error | null, user: any): any {
    // 如果有错误或者没有用户信息，抛出未授权异常
    if (err || !user) {
      throw err || new UnauthorizedException('访问令牌无效或已过期');
    }
    return user;
  }
}
