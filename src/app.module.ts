import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { MenuModule } from './modules/menu/menu.module';
import { ProductModule } from './modules/product/product.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // 配置模块，全局注册并读取.env文件
    ConfigModule,
    // PostgreSQL数据库连接配置
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): PostgresConnectionOptions => {
        const dbConfig: PostgresConnectionOptions = {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          schema: configService.get<string>('DB_SCHEMA'),
          entities: [__dirname + '/../**/*.entity.js'],
          synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
        };
        return dbConfig;
      },
    }),
    UserModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    MenuModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 注册全局守卫，注意执行顺序
    // 1. JwtAuthGuard：进行JWT身份验证，并将用户信息附加到request.user
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 2. RolesGuard：在身份验证成功后，进行角色权限检查
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // 全局响应格式化拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
