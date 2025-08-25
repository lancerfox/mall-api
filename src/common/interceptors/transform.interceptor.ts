import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IApiResponse } from '../types/api-response.interface';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/error-codes';

/**
 * 全局响应格式化拦截器
 * 统一处理API响应格式
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, IApiResponse<T>>
{
  /**
   * 拦截请求并格式化响应
   * @param context 执行上下文
   * @param next 调用处理器
   * @returns 格式化后的响应
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    return next.handle().pipe(
      map((data: T) => ({
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
