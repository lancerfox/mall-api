import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/error-codes';

/**
 * @class BusinessException
 * @classdesc 自定义业务异常类，用于处理业务逻辑中的可预见错误。
 * @example throw new BusinessException(ERROR_CODES.USER_NOT_FOUND);
 */
export class BusinessException extends HttpException {
  /**
   * 构造函数
   * @param errorCode 业务错误码，必须在 ERROR_CODES 中定义
   * @param additionalData 额外的数据，会合并到响应体中
   */
  constructor(
    errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES],
    additionalData?: any,
  ) {
    const message = ERROR_MESSAGES[errorCode] || '未知错误';
    const response = {
      code: errorCode,
      message,
      data: null,
      ...additionalData,
    };
    // 根据项目规范，所有业务异常的 HTTP 状态码都返回 200
    super(response, HttpStatus.OK);
  }
}
