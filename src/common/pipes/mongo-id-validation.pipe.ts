import {
  PipeTransform,
  Injectable,
  // ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ERROR_CODES } from '../constants/error-codes';

@Injectable()
export class MongoIdValidationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException({
        message: '无效的ID格式',
        errorCode: ERROR_CODES.VALIDATION_INVALID_ID,
      });
    }
    return value;
  }
}
