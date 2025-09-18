import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InventoryAdjustDto } from './inventory-adjust.dto';
import { InventoryInboundDto } from './inventory-inbound.dto';
import { InventoryOutboundDto } from './inventory-outbound.dto';

export class BatchAdjustDto {
  @ApiProperty({
    description: '调整列表',
    type: [InventoryAdjustDto],
    required: true,
  })
  @IsNotEmpty({ message: '调整列表不能为空' })
  @IsArray({ message: '调整列表必须是数组' })
  @ArrayMinSize(1, { message: '调整列表至少包含1项' })
  @ArrayMaxSize(1000, { message: '调整列表最多包含1000项' })
  @ValidateNested({ each: true })
  @Type(() => InventoryAdjustDto)
  adjustments: InventoryAdjustDto[];

  @ApiProperty({
    description: '批次备注',
    example: '批量调整操作',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '批次备注必须是字符串' })
  @MaxLength(500, { message: '批次备注不能超过500个字符' })
  batchNotes?: string;

  @ApiProperty({
    description: '操作日期',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '操作日期格式不正确' })
  operationDate?: string;
}

export class BatchInboundDto {
  @ApiProperty({
    description: '入库操作列表',
    type: [InventoryInboundDto],
    required: true,
  })
  @IsNotEmpty({ message: '入库操作列表不能为空' })
  @IsArray({ message: '入库操作列表必须是数组' })
  @ArrayMinSize(1, { message: '入库操作列表至少包含1项' })
  @ArrayMaxSize(1000, { message: '入库操作列表最多包含1000项' })
  @ValidateNested({ each: true })
  @Type(() => InventoryInboundDto)
  operations: InventoryInboundDto[];

  @ApiProperty({
    description: '批次备注',
    example: '批量入库操作',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '批次备注必须是字符串' })
  @MaxLength(500, { message: '批次备注不能超过500个字符' })
  batchNotes?: string;

  @ApiProperty({
    description: '操作日期',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '操作日期格式不正确' })
  operationDate?: string;
}

export class BatchOutboundDto {
  @ApiProperty({
    description: '出库操作列表',
    type: [InventoryOutboundDto],
    required: true,
  })
  @IsNotEmpty({ message: '出库操作列表不能为空' })
  @IsArray({ message: '出库操作列表必须是数组' })
  @ArrayMinSize(1, { message: '出库操作列表至少包含1项' })
  @ArrayMaxSize(1000, { message: '出库操作列表最多包含1000项' })
  @ValidateNested({ each: true })
  @Type(() => InventoryOutboundDto)
  operations: InventoryOutboundDto[];

  @ApiProperty({
    description: '批次备注',
    example: '批量出库操作',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '批次备注必须是字符串' })
  @MaxLength(500, { message: '批次备注不能超过500个字符' })
  batchNotes?: string;

  @ApiProperty({
    description: '操作日期',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '操作日期格式不正确' })
  operationDate?: string;
}
