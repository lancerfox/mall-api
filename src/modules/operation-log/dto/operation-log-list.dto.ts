import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { OperationType } from '../entities/operation-log.entity';

// 辅助函数：将空字符串转换为 undefined
const emptyStringToUndefined = ({ value }: { value: unknown }) =>
  value === '' ? undefined : value;

export class OperationLogListDto extends PaginationDto {
  @ApiPropertyOptional({
    description: '操作模块',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({
    description: '操作类型',
    enum: OperationType,
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsEnum(OperationType)
  operationType?: OperationType;

  @ApiPropertyOptional({
    description: '操作用户',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: '开始时间',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({
    description: '结束时间',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString()
  endTime?: string;
}
