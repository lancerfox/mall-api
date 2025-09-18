import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  Min,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class MaterialListDto {
  @ApiProperty({ description: '页码', example: 1 })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page: number;

  @ApiProperty({ description: '每页数量', example: 20, enum: [10, 20, 50] })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsEnum([10, 20, 50])
  pageSize: number;

  @ApiProperty({ description: '搜索关键词', example: '', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  keyword?: string;

  @ApiProperty({ description: '分类ID', example: '', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: '分类ID数组',
    example: ['C001', 'C002'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiProperty({
    description: '状态筛选',
    example: '',
    enum: ['', 'enabled', 'disabled'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['', 'enabled', 'disabled'])
  status?: string;

  @ApiProperty({
    description: '状态数组',
    example: ['enabled', 'disabled'],
    enum: ['enabled', 'disabled'],
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['enabled', 'disabled'], { each: true })
  statuses?: string[];

  @ApiProperty({
    description: '最低价格',
    example: 10.0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @ApiProperty({
    description: '最高价格',
    example: 100.0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  @IsNumber()
  @Min(0)
  priceMax?: number;

  @ApiProperty({
    description: '最低库存',
    example: 0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  @IsNumber()
  @Min(0)
  stockMin?: number;

  @ApiProperty({
    description: '最高库存',
    example: 1000,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  @IsNumber()
  @Min(0)
  stockMax?: number;

  @ApiProperty({
    description: '颜色数组',
    example: ['红色', '蓝色'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  @ApiProperty({
    description: '最低硬度',
    example: 1,
    required: false,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  @IsNumber()
  @Min(1)
  hardnessMin?: number;

  @ApiProperty({
    description: '最高硬度',
    example: 10,
    required: false,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  @IsNumber()
  @Min(1)
  hardnessMax?: number;

  @ApiProperty({
    description: '最低密度',
    example: 1.0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  @IsNumber()
  @Min(0)
  densityMin?: number;

  @ApiProperty({
    description: '最高密度',
    example: 5.0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  @IsNumber()
  @Min(0)
  densityMax?: number;

  @ApiProperty({
    description: '开始日期',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsString()
  dateStart?: string;

  @ApiProperty({
    description: '结束日期',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsString()
  dateEnd?: string;

  @ApiProperty({
    description: '排序字段',
    example: 'createdAt',
    enum: ['name', 'price', 'stock', 'createdAt', 'updatedAt'],
    required: false,
    default: 'createdAt',
  })
  @IsOptional()
  @IsEnum(['name', 'price', 'stock', 'createdAt', 'updatedAt'])
  sortBy?: string;

  @ApiProperty({
    description: '排序方向',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false,
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string;
}
