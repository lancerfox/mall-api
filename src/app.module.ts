import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // 配置模块，全局注册并读取.env文件
    ConfigModule,
    // MongoDB数据库连接配置
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri:
          process.env.DATABASE_URL ||
          'mongodb+srv://xiesp01:xie123456@cluster0.l63pjew.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
      }),
    }),
    UserModule,
    AuthModule,
    RoleModule,
    PermissionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局角色守卫
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
