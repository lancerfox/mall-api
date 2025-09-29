import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { OperationType } from '../entities/operation-log.entity';

export class OperationLogListDto extends PaginationDto {
  @ApiProperty({
    description: '操作模块',
    required: false,
  })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiProperty({
    description: '操作类型',
    enum: OperationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(OperationType)
  operationType?: OperationType;

  @ApiProperty({
    description: '操作用户',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: '开始时间',
    required: false,
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({
    description: '结束时间',
    required: false,
  })
  @IsOptional()
  @IsString()
  endTime?: string;
}
