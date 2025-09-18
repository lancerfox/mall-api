import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { OperationType } from '../entities/operation-log.entity';

export class GetOperationLogsDto {
  @ApiProperty({
    description: '页码',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  limit?: number = 10;

  @ApiProperty({
    description: '操作类型',

    enum: OperationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(OperationType)
  operationType?: OperationType;

  @ApiProperty({
    description: '操作者用户ID',
    example: '64b5f8e8f123456789abcdef',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: '材料ID',
    example: '64b5f8e8f123456789abcdef',
    required: false,
  })
  @IsOptional()
  @IsString()
  materialId?: string;

  @ApiProperty({
    description: '开始日期',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: '结束日期',
    example: '2024-12-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: '搜索关键词（用户名或材料名）',
    example: '翡翠',
    required: false,
  })
  @IsOptional()
  @IsString()
  keyword?: string;
}

export class GetUserOperationLogsDto {
  @ApiProperty({
    description: '页码',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  limit?: number = 10;

  @ApiProperty({
    description: '操作类型',

    enum: OperationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(OperationType)
  operationType?: OperationType;

  @ApiProperty({
    description: '材料ID',
    example: '64b5f8e8f123456789abcdef',
    required: false,
  })
  @IsOptional()
  @IsString()
  materialId?: string;

  @ApiProperty({
    description: '开始日期',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: '结束日期',
    example: '2024-12-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
