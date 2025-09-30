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
 * 类型守卫：检查值是否为日期字符串
 * @param value 要检查的值
 * @returns 如果是日期字符串则返回true
 */
function isDateString(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  // 检查是否为有效的日期字符串
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * 类型守卫：检查值是否为普通对象（非数组、非null）
 * @param value 要检查的值
 * @returns 如果是普通对象则返回true
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

/**
 * 递归格式化响应数据中的日期字段
 * @param data 响应数据
 */
function formatResponseData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof Date) {
    return formatDate(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => formatResponseData(item));
  }

  if (isPlainObject(data)) {
    const newData: Record<string, unknown> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        if ((key === 'createdAt' || key === 'updatedAt') && value) {
          // 安全地处理日期字段
          if (value instanceof Date) {
            newData[key] = formatDate(value);
          } else if (isDateString(value)) {
            newData[key] = formatDate(new Date(value));
          } else {
            newData[key] = formatResponseData(value);
          }
        } else {
          newData[key] = formatResponseData(value);
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
        data: formatResponseData(data) as T,
      })),
    );
  }
}
