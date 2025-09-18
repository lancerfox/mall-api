import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryOutboundDto {
  @ApiProperty({
    description: '材料ID',
    example: 'M001',
    required: true,
  })
  @IsNotEmpty({ message: '材料ID不能为空' })
  @IsString({ message: '材料ID必须是字符串' })
  materialId: string;

  @ApiProperty({
    description: '出库数量',
    example: 50,
    minimum: 1,
    required: true,
  })
  @IsNotEmpty({ message: '出库数量不能为空' })
  @IsNumber({}, { message: '出库数量必须是数字' })
  @Min(1, { message: '出库数量必须大于0' })
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    description: '客户',
    example: '客户A',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '客户必须是字符串' })
  @MaxLength(50, { message: '客户名称不能超过50个字符' })
  customer?: string;

  @ApiProperty({
    description: '出库原因',
    example: '销售',
    enum: ['销售', '损耗', '调拨', '盘亏', '其他'],
    required: true,
  })
  @IsNotEmpty({ message: '出库原因不能为空' })
  @IsEnum(['销售', '损耗', '调拨', '盘亏', '其他'], {
    message: '出库原因只能是销售、损耗、调拨、盘亏、其他',
  })
  reason: string;

  @ApiProperty({
    description: '备注',
    example: '销售给客户A',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  @MaxLength(500, { message: '备注不能超过500个字符' })
  notes?: string;

  @ApiProperty({
    description: '操作日期',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '操作日期格式不正确' })
  operationDate?: string;
}
