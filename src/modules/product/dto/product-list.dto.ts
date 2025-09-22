import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';

export class ProductListFilters {
  @ApiProperty({ description: '商品名称', example: '沉香', required: false })
  @IsOptional()
  @IsString({ message: '商品名称必须是字符串' })
  name?: string;

  @ApiProperty({
    description: '商品ID',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '商品ID必须是字符串' })
  id?: string;

  @ApiProperty({
    description: '分类ID',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '分类ID必须是字符串' })
  categoryId?: string;

  @ApiProperty({
    description: '商品状态',
    example: 'Draft',
    enum: ['Draft', 'On-shelf', 'Off-shelf'],
    required: false,
  })
  @IsOptional()
  @IsString({ message: '商品状态必须是字符串' })
  @IsIn(['Draft', 'On-shelf', 'Off-shelf'], {
    message: '商品状态只能是Draft、On-shelf或Off-shelf',
  })
  status?: string;
}

export class ProductListDto {
  @ApiProperty({ description: '页码', example: 1, required: true })
  @IsNotEmpty({ message: '页码不能为空' })
  @IsNumber({}, { message: '页码必须是数字' })
  page: number;

  @ApiProperty({ description: '每页数量', example: 10, required: true })
  @IsNotEmpty({ message: '每页数量不能为空' })
  @IsNumber({}, { message: '每页数量必须是数字' })
  pageSize: number;

  @ApiProperty({
    description: '筛选条件',
    type: ProductListFilters,
    required: false,
  })
  @IsOptional()
  filters?: ProductListFilters;
}
