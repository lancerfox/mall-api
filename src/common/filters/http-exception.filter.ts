import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { IApiResponse } from '../types/api-response.interface';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/error-codes';

interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, unknown>;
}

interface ValidationError {
  property: string;
  constraints: { [type: string]: string };
}

/**
 * 全局HTTP异常过滤器
 * 统一处理HTTP异常并格式化错误响应
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * 捕获并处理所有异常
   * @param exception 异常对象
   * @param host 参数主机对象
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let errors: { [key: string]: string[] } | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as
        | string
        | { message: string | string[] };

      // 处理验证错误
      if (
        exception instanceof BadRequestException &&
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse &&
        Array.isArray(exceptionResponse.message)
      ) {
        message = '数据验证失败';
        errors = this.formatValidationErrors(
          exceptionResponse.message as (string | ValidationError)[],
        );
      } else {
        message = this.getErrorMessage(exceptionResponse, status);
      }
    } else if (exception instanceof Error) {
      // 处理其他类型的错误
      message = exception.message || '未知错误';

      // 数据库错误处理
      if (
        exception.name === 'MongoError' ||
        exception.name === 'MongoServerError'
      ) {
        status = HttpStatus.BAD_REQUEST;
        message = this.formatMongoError(exception);
      }

      // JWT错误处理
      if (exception.name === 'JsonWebTokenError') {
        status = HttpStatus.UNAUTHORIZED;
        message = '无效的访问令牌';
      }

      if (exception.name === 'TokenExpiredError') {
        status = HttpStatus.UNAUTHORIZED;
        message = '访问令牌已过期';
      }
    }

    // 记录错误日志
    this.logger.error(
      `Exception: ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
      `${request.method} ${request.url}`,
    );

    // 构造错误响应
    const errorResponse: IApiResponse<null> = {
      code: this.getErrorCode(status, message),
      message,
      data: null,
      timestamp: new Date().toISOString(),
    };

    // 只在有验证错误时添加errors字段
    if (errors) {
      errorResponse.errors = errors;
    }

    response.status(HttpStatus.OK).json(errorResponse);
  }

  /**
   * 根据HTTP状态码和错误消息获取错误码
   * @param status HTTP状态码
   * @param message 错误消息
   * @returns 错误码
   */
  private getErrorCode(status: number, message?: string): number {
    const statusCode = status as HttpStatus;

    // 处理认证相关的错误码映射
    if (statusCode === HttpStatus.UNAUTHORIZED && message) {
      if (
        message.includes('用户名或密码错误') ||
        message.includes('账号或密码错误')
      ) {
        return ERROR_CODES.AUTH_INVALID_CREDENTIALS;
      }
      if (message.includes('无效的访问令牌')) {
        return ERROR_CODES.INVALID_TOKEN;
      }
      if (message.includes('访问令牌已过期')) {
        return ERROR_CODES.AUTH_TOKEN_INVALID;
      }
    }

    switch (statusCode) {
      case HttpStatus.UNAUTHORIZED:
        return ERROR_CODES.AUTH_TOKEN_INVALID;
      case HttpStatus.FORBIDDEN:
        return ERROR_CODES.PERMISSION_INSUFFICIENT;
      case HttpStatus.BAD_REQUEST:
        return ERROR_CODES.VALIDATION_FAILED;
      default:
        return ERROR_CODES.VALIDATION_FAILED;
    }
  }

  /**
   * 获取错误消息
   * @param exceptionResponse 异常响应
   * @param status HTTP状态码
   * @returns 错误消息
   */
  private getErrorMessage(
    exceptionResponse: string | object,
    status: number,
  ): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const responseObj = exceptionResponse as { message: string | string[] };
      const message = responseObj.message;
      return Array.isArray(message) ? message.join(', ') : String(message);
    }

    const errorCode = this.getErrorCode(status);
    return (
      (ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] as string) ||
      '未知错误'
    );
  }

  /**
   * 格式化验证错误信息
   * @param validationErrors 验证错误数组
   * @returns 格式化后的错误信息
   */
  private formatValidationErrors(
    validationErrors: (string | ValidationError)[],
  ): { [key: string]: string[] } {
    const errors: { [key: string]: string[] } = {};

    validationErrors.forEach((error) => {
      if (typeof error === 'string') {
        if (!errors.general) {
          errors.general = [];
        }
        errors.general.push(error);
      } else if (error.property && error.constraints) {
        const field = error.property;
        const messages = Object.values(error.constraints);
        errors[field] = messages;
      }
    });

    return errors;
  }

  /**
   * 格式化MongoDB错误信息
   * @param error MongoDB错误
   * @returns 用户友好的错误信息
   */
  private formatMongoError(error: MongoError): string {
    if (error.code === 11000) {
      // 重复键错误
      const field = Object.keys(error.keyPattern || {})[0];
      return field ? `${field}已存在，请使用其他值` : '数据重复，请检查输入';
    }

    if (error.code === 121) {
      // 文档验证失败
      return '数据格式不符合要求';
    }

    return '数据库操作失败';
  }
}
