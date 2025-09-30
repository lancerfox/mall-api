import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { BusinessException } from '../exceptions/business.exception';

/**
 * @class HttpExceptionFilter
 * @classdesc 全局异常过滤器，用于捕获 HttpException 并格式化响应。
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // 处理自定义的业务异常
    if (exception instanceof BusinessException) {
      const errorResponse = exception.getResponse();
      // 根据项目规范，业务异常的 HTTP 状态码为 200
      response.status(HttpStatus.OK).json(errorResponse);
      return;
    }

    // 处理其他所有 HttpException
    // 对于非业务异常，可以根据需要记录日志
    // logger.error(exception.message, exception.stack);

    // 为常见的 HTTP 状态码提供默认错误消息
    const getDefaultMessage = (status: number): string => {
      switch (status) {
        case HttpStatus.UNAUTHORIZED:
          return '未授权访问';
        case HttpStatus.FORBIDDEN:
          return '禁止访问';
        case HttpStatus.NOT_FOUND:
          return '资源不存在';
        case HttpStatus.BAD_REQUEST:
          return '请求参数错误';
        case HttpStatus.INTERNAL_SERVER_ERROR:
          return '服务器内部错误';
        default:
          return exception.message || '未知错误';
      }
    };

    response.status(status).json({
      code: status,
      message: getDefaultMessage(status),
      data: null,
    });
  }
}
