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

export class InventoryAdjustDto {
  @ApiProperty({
    description: '材料ID',
    example: 'M001',
    required: true,
  })
  @IsNotEmpty({ message: '材料ID不能为空' })
  @IsString({ message: '材料ID必须是字符串' })
  materialId: string;

  @ApiProperty({
    description: '调整类型',
    example: 'add',
    enum: ['add', 'subtract', 'set'],
    required: true,
  })
  @IsNotEmpty({ message: '调整类型不能为空' })
  @IsEnum(['add', 'subtract', 'set'], {
    message: '调整类型只能是add、subtract、set',
  })
  adjustType: string;

  @ApiProperty({
    description: '调整数量',
    example: 10,
    minimum: 1,
    required: true,
  })
  @IsNotEmpty({ message: '调整数量不能为空' })
  @IsNumber({}, { message: '调整数量必须是数字' })
  @Min(1, { message: '调整数量必须大于0' })
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    description: '调整原因',
    example: '入库',
    minLength: 2,
    maxLength: 50,
    required: true,
  })
  @IsNotEmpty({ message: '调整原因不能为空' })
  @IsString({ message: '调整原因必须是字符串' })
  @MaxLength(50, { message: '调整原因不能超过50个字符' })
  reason: string;

  @ApiProperty({
    description: '调整备注',
    example: '采购入库',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '调整备注必须是字符串' })
  @MaxLength(500, { message: '调整备注不能超过500个字符' })
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
