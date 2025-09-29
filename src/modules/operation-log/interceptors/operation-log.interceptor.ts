import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { OperationLogService } from '../services/operation-log.service';
import { OperationType } from '../entities/operation-log.entity';
import { Request } from 'express';

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(private readonly operationLogService: OperationLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // 在请求处理完成后记录日志
    void this.createOperationLog(request);
    return next.handle();
  }

  private async createOperationLog(request: Request) {
    try {
      // 获取用户信息
      const user = request.user as Record<string, any> | undefined;

      // 确定操作类型
      let operationType: OperationType;
      switch (request.method) {
        case 'POST':
          operationType = OperationType.CREATE;
          break;
        case 'PUT':
        case 'PATCH':
          operationType = OperationType.UPDATE;
          break;
        case 'DELETE':
          operationType = OperationType.DELETE;
          break;
        case 'GET':
          operationType = OperationType.QUERY;
          break;
        default:
          operationType = OperationType.QUERY;
      }

      // 获取模块名（从URL路径中提取）
      const urlParts = request.url.split('/').filter((part) => part);
      const module = urlParts.length > 0 ? urlParts[0] : 'unknown';

      // 构造操作描述
      const descriptions = {
        [OperationType.CREATE]: '创建数据',
        [OperationType.UPDATE]: '更新数据',
        [OperationType.DELETE]: '删除数据',
        [OperationType.QUERY]: '查询数据',
        [OperationType.LOGIN]: '用户登录',
        [OperationType.LOGOUT]: '用户登出',
        [OperationType.EXPORT]: '导出数据',
        [OperationType.IMPORT]: '导入数据',
      };

      // 创建操作日志
      await this.operationLogService.create({
        userId: (user?.['sub'] as string) || 'unknown',
        username: (user?.['username'] as string) || 'anonymous',
        module,
        operationType,
        description: descriptions[operationType],
        method: request.method,
        url: request.url,
        ip: this.getClientIP(request),
        userAgent: request.get('user-agent'),
      });
    } catch (err) {
      // 记录日志失败不应该影响主业务流程
      console.error('记录操作日志失败:', err);
    }
  }

  private getClientIP(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string) ||
      (request.headers['x-real-ip'] as string) ||
      request.ip ||
      'unknown'
    );
  }
}
