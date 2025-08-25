import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OperationLog,
  OperationLogSchema,
} from './entities/operation-log.entity';
import { OperationLogInterceptor } from './interceptors/operation-log.interceptor';
import { OperationLogService } from './services/operation-log.service';
import { OperationLogController } from './controllers/operation-log.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    // 注册OperationLog Schema到MongoDB
    MongooseModule.forFeature([
      { name: OperationLog.name, schema: OperationLogSchema },
    ]),
    // 导入UserModule以供RolesGuard使用UserService
    UserModule,
  ],
  controllers: [OperationLogController],
  providers: [OperationLogInterceptor, OperationLogService],
  exports: [OperationLogInterceptor, OperationLogService],
})
export class LogModule {}
