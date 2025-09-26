import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './services/auth.service';
import { SecurityService } from './services/security.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    // 导入UserModule以使用UserService
    UserModule,

    // 配置JWT模块
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, SecurityService, JwtStrategy, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, SecurityService, RolesGuard],
})
export class AuthModule {}
