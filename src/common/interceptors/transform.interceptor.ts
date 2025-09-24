import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/error-codes';
import { IApiResponse } from '../types/api-response.interface';
import { formatDate } from '../utils/date-format';

/**
 * 递归格式化响应数据中的日期字段
 * @param data 响应数据
 */
function formatResponseData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof Date) {
    return formatDate(data);
  }

  if (Array.isArray(data)) {
    return data.map(formatResponseData);
  }

  if (typeof data === 'object') {
    const newData: { [key: string]: any } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if ((key === 'createdAt' || key === 'updatedAt') && data[key]) {
          newData[key] = formatDate(new Date(data[key]));
        } else {
          newData[key] = formatResponseData(data[key]);
        }
      }
    }
    return newData;
  }

  return data;
}

/**
 * 全局响应格式化拦截器
 * 统一处理API响应格式并格式化日期
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
        data: formatResponseData(data),
      })),
    );
  }
}
