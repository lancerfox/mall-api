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

export class InventoryInboundDto {
  @ApiProperty({
    description: '材料ID',
    example: 'M001',
    required: true,
  })
  @IsNotEmpty({ message: '材料ID不能为空' })
  @IsString({ message: '材料ID必须是字符串' })
  materialId: string;

  @ApiProperty({
    description: '入库数量',
    example: 100,
    minimum: 1,
    required: true,
  })
  @IsNotEmpty({ message: '入库数量不能为空' })
  @IsNumber({}, { message: '入库数量必须是数字' })
  @Min(1, { message: '入库数量必须大于0' })
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    description: '入库单价',
    example: 15.5,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '入库单价必须是数字' })
  @Min(0, { message: '入库单价不能小于0' })
  @Type(() => Number)
  unitPrice?: number;

  @ApiProperty({
    description: '供应商',
    example: '供应商A',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '供应商必须是字符串' })
  @MaxLength(50, { message: '供应商名称不能超过50个字符' })
  supplier?: string;

  @ApiProperty({
    description: '入库原因',
    example: '采购',
    enum: ['采购', '退货', '调拨', '盘盈', '其他'],
    required: true,
  })
  @IsNotEmpty({ message: '入库原因不能为空' })
  @IsEnum(['采购', '退货', '调拨', '盘盈', '其他'], {
    message: '入库原因只能是采购、退货、调拨、盘盈、其他',
  })
  reason: string;

  @ApiProperty({
    description: '备注',
    example: '新采购的红玛瑙',
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
