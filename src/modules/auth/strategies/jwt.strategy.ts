import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services/user.service';
import { IJwtPayload } from '../types';
import { ERROR_CODES } from '../../../common/constants/error-codes';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  async validate(payload: IJwtPayload) {
    // console.log('JWT Strategy - validating payload:', payload);

    // 验证用户是否存在且状态正常
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      console.log('JWT Strategy - user not found:', payload.sub);
      throw new UnauthorizedException({
        message: '用户不存在',
        errorCode: ERROR_CODES.USER_NOT_FOUND,
      });
    }

    if (user.status !== 'active') {
      console.log('JWT Strategy - user not active:', user.status);
      throw new UnauthorizedException({
        message: '用户账户已被禁用',
        errorCode: ERROR_CODES.ACCOUNT_DISABLED,
      });
    }

    // console.log(
    //   'JWT Strategy - validation successful for user:',
    //   user.username,
    // );

    // 返回用户信息，这将被添加到request.user中
    return {
      sub: payload.sub, // 保持原有的sub字段
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      id: payload.sub,
    };
  }
}
