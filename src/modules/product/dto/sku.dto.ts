import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsIn,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SpecificationDto } from './specification.dto';

export class SkuDto {
  @ApiProperty({
    description: 'SKU ID，更新时必填',
    example: null,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'SKU ID必须是字符串' })
  id?: string;

  @ApiProperty({
    description: '规格属性列表',
    type: [SpecificationDto],
    example: [{ key: '珠子直径', value: '8mm' }],
    required: true,
  })
  @IsNotEmpty({ message: '规格列表不能为空' })
  @IsArray({ message: '规格必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => SpecificationDto)
  specifications: SpecificationDto[];

  @ApiProperty({
    description: 'SKU图片URL',
    example: 'https://example.com/sku.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'SKU图片必须是字符串' })
  image?: string;

  @ApiProperty({ description: '销售价', example: 299.99, required: true })
  @IsNotEmpty({ message: '销售价不能为空' })
  @IsNumber({}, { message: '销售价必须是数字' })
  price: number;

  @ApiProperty({ description: '市场价', example: 399.99, required: false })
  @IsOptional()
  @IsNumber({}, { message: '市场价必须是数字' })
  marketPrice?: number;

  @ApiProperty({ description: '库存', example: 100, required: true })
  @IsNotEmpty({ message: '库存不能为空' })
  @IsNumber({}, { message: '库存必须是数字' })
  @Min(0, { message: '库存不能为负数' })
  stock: number;

  @ApiProperty({ description: 'SKU编码', example: 'SKU001', required: false })
  @IsOptional()
  @IsString({ message: 'SKU编码必须是字符串' })
  skuCode?: string;

  @ApiProperty({
    description: '状态 (0: 禁用, 1: 启用)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  @IsIn([0, 1], { message: '状态只能是0或1' })
  status?: number;
}
