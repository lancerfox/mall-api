import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  OperationLog,
  OperationLogDocument,
} from '../entities/operation-log.entity';

interface RequestWithUser {
  user?: {
    id?: string;
    _id?: string;
    username?: string;
  };
  method: string;
  url: string;
  ip: string;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
}

interface LogData {
  userId?: string;
  username: string;
  action: string;
  module: string;
  description: string;
  ip: string;
  userAgent?: string;
  requestData?: unknown;
  responseData?: unknown;
  status: 'success' | 'error';
  executionTime: number;
  method: string;
  url: string;
  errorMessage?: string;
}

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(
    @InjectModel(OperationLog.name)
    private operationLogModel: Model<OperationLogDocument>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    // 提取用户信息（假设从JWT token中获取）
    const user = request.user;
    const userId = user?.id || user?._id;
    const username = user?.username || 'anonymous';

    // 提取请求信息
    const { method, url, ip, body, headers } = request;
    const userAgent = Array.isArray(headers['user-agent'])
      ? headers['user-agent'][0]
      : headers['user-agent'];

    // 确定操作模块和动作
    const module = this.extractModule(url);
    const action = this.extractAction(method, url);

    return next.handle().pipe(
      tap((data: unknown) => {
        // 成功情况下记录日志
        const executionTime = Date.now() - startTime;
        void this.createLog({
          userId,
          username,
          action,
          module,
          description: this.generateDescription(action, module),
          ip,
          userAgent,
          requestData: this.sanitizeRequestData(body),
          responseData: this.sanitizeResponseData(data),
          status: 'success',
          executionTime,
          method,
          url,
        });
      }),
      catchError((error: Error) => {
        // 错误情况下记录日志
        const executionTime = Date.now() - startTime;
        void this.createLog({
          userId,
          username,
          action,
          module,
          description: this.generateDescription(action, module),
          ip,
          userAgent,
          requestData: this.sanitizeRequestData(body),
          status: 'error',
          errorMessage: error.message || '操作失败',
          executionTime,
          method,
          url,
        });
        return throwError(() => error);
      }),
    );
  }

  private async createLog(logData: LogData): Promise<void> {
    try {
      // 只有在用户已认证的情况下才记录日志
      if (logData.userId && logData.username !== 'anonymous') {
        await this.operationLogModel.create(logData);
      }
    } catch (error) {
      // 记录日志失败不应该影响主要业务流程
      console.error('Failed to create operation log:', error);
    }
  }

  private extractModule(url: string): string {
    // 从URL中提取模块名
    const pathSegments = url.split('/').filter((segment) => segment);

    if (pathSegments.length >= 2 && pathSegments[0] === 'api') {
      return pathSegments[1];
    }

    return pathSegments[0] || 'unknown';
  }

  private extractAction(method: string, url: string): string {
    // 根据HTTP方法和URL确定操作动作
    const lowerMethod = method.toLowerCase();

    if (url.includes('/login')) return 'login';
    if (url.includes('/logout')) return 'logout';
    if (url.includes('/password')) return 'change_password';
    if (url.includes('/reset-password')) return 'reset_password';
    if (url.includes('/status')) return 'change_status';

    switch (lowerMethod) {
      case 'post':
        return 'create';
      case 'put':
      case 'patch':
        return 'update';
      case 'delete':
        return 'delete';
      case 'get':
        return url.includes('/:') || /\/\d+/.test(url) ? 'view' : 'list';
      default:
        return 'unknown';
    }
  }

  private generateDescription(action: string, module: string): string {
    const actionMap: Record<string, string> = {
      create: '创建',
      update: '更新',
      delete: '删除',
      view: '查看',
      list: '列表查询',
      login: '登录',
      logout: '退出登录',
      change_password: '修改密码',
      reset_password: '重置密码',
      change_status: '修改状态',
    };

    const moduleMap: Record<string, string> = {
      users: '用户',
      menus: '菜单',
      auth: '认证',
      logs: '日志',
    };

    const actionText = actionMap[action] || action;
    const moduleText = moduleMap[module] || module;

    return `${actionText}${moduleText}`;
  }

  private sanitizeRequestData(data: unknown): unknown {
    if (!data) return null;

    // 移除敏感信息
    const sanitized = { ...(data as Record<string, unknown>) };
    const sensitiveFields = ['password', 'token', 'secret', 'key'];

    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = '***';
      }
    });

    return sanitized;
  }

  private sanitizeResponseData(data: unknown): unknown {
    if (!data) return null;

    // 限制响应数据大小，避免存储过大的数据
    const maxSize = 1000; // 最大字符数
    const stringified = JSON.stringify(data);

    if (stringified.length > maxSize) {
      return {
        message: '响应数据过大，已省略',
        size: stringified.length,
      };
    }

    // 移除敏感信息
    const sanitized = { ...(data as Record<string, unknown>) };
    const sensitiveFields = ['password', 'token', 'secret', 'key'];

    if (typeof sanitized === 'object' && sanitized !== null) {
      sensitiveFields.forEach((field) => {
        if (field in sanitized) {
          sanitized[field] = '***';
        }
      });
    }

    return sanitized;
  }
}
