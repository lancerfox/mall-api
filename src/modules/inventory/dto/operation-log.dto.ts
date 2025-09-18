import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OperationLogDto {
  @ApiProperty({
    description: '页码',
    example: 1,
    minimum: 1,
    required: true,
  })
  @IsNumber({}, { message: '页码必须是数字' })
  @Min(1, { message: '页码必须大于0' })
  @Type(() => Number)
  page: number;

  @ApiProperty({
    description: '每页数量',
    example: 20,
    enum: [10, 20, 50, 100],
    required: true,
  })
  @IsNumber({}, { message: '每页数量必须是数字' })
  @IsEnum([10, 20, 50, 100], { message: '每页数量只能是10、20、50、100' })
  @Type(() => Number)
  pageSize: number;

  @ApiProperty({
    description: '材料ID',
    example: 'M001',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '材料ID必须是字符串' })
  materialId?: string;

  @ApiProperty({
    description: '操作类型',
    example: 'inbound',
    enum: ['inbound', 'outbound', 'adjust'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['inbound', 'outbound', 'adjust'], {
    message: '操作类型只能是inbound、outbound、adjust',
  })
  operationType?: string;

  @ApiProperty({
    description: '操作原因',
    example: '采购',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '操作原因必须是字符串' })
  reason?: string;

  @ApiProperty({
    description: '开始日期',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '开始日期格式不正确' })
  dateStart?: string;

  @ApiProperty({
    description: '结束日期',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '结束日期格式不正确' })
  dateEnd?: string;

  @ApiProperty({
    description: '操作人',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '操作人必须是字符串' })
  createdBy?: string;

  @ApiProperty({
    description: '排序字段',
    example: 'createdAt',
    enum: ['operationDate', 'createdAt', 'quantity', 'totalValue'],
    required: false,
    default: 'createdAt',
  })
  @IsOptional()
  @IsEnum(['operationDate', 'createdAt', 'quantity', 'totalValue'], {
    message: '排序字段只能是operationDate、createdAt、quantity、totalValue',
  })
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: '排序方向',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false,
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: '排序方向只能是asc或desc' })
  sortOrder?: string = 'desc';
}
