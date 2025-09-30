import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass, ClassConstructor } from 'class-transformer';
import { BusinessException } from '../exceptions/business.exception';
import { ERROR_CODES } from '../constants/error-codes';

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object, {
      whitelist: true, // 自动移除不在DTO中定义的属性
      forbidNonWhitelisted: true, // 如果有额外属性则抛出错误
    });

    if (errors.length > 0) {
      const errorMessages = this.formatErrors(errors);
      throw new BusinessException(ERROR_CODES.VALIDATION_FAILED, {
        errors: errorMessages,
      });
    }

    return object;
  }

  private toValidate(metatype: unknown): metatype is ClassConstructor<object> {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype as never);
  }

  private formatErrors(errors: ValidationError[]): { [key: string]: string[] } {
    const formattedErrors: { [key: string]: string[] } = {};

    errors.forEach((error) => {
      const property = error.property;
      const constraints = error.constraints;

      if (constraints) {
        formattedErrors[property] = Object.values(constraints);
      }

      // 处理嵌套对象的验证错误
      if (error.children && error.children.length > 0) {
        const nestedErrors = this.formatErrors(error.children);
        Object.keys(nestedErrors).forEach((nestedProperty) => {
          const fullProperty = `${property}.${nestedProperty}`;
          formattedErrors[fullProperty] = nestedErrors[nestedProperty];
        });
      }
    });

    return formattedErrors;
  }
}
