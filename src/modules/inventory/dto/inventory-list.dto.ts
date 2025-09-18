import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryListDto {
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
    description: '搜索关键词',
    example: '红玛瑙',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;

  @ApiProperty({
    description: '分类ID',
    example: 'C001',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '分类ID必须是字符串' })
  categoryId?: string;

  @ApiProperty({
    description: '库存状态',
    example: 'normal',
    enum: ['', 'normal', 'warning', 'critical', 'out_of_stock'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['', 'normal', 'warning', 'critical', 'out_of_stock'], {
    message: '库存状态只能是normal、warning、critical、out_of_stock',
  })
  stockStatus?: string;

  @ApiProperty({
    description: '最小库存',
    example: 0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '最小库存必须是数字' })
  @Min(0, { message: '最小库存不能小于0' })
  @Type(() => Number)
  stockMin?: number;

  @ApiProperty({
    description: '最大库存',
    example: 1000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '最大库存必须是数字' })
  @Min(0, { message: '最大库存不能小于0' })
  @Type(() => Number)
  stockMax?: number;

  @ApiProperty({
    description: '最小价值',
    example: 0.0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '最小价值必须是数字' })
  @Min(0, { message: '最小价值不能小于0' })
  @Type(() => Number)
  valueMin?: number;

  @ApiProperty({
    description: '最大价值',
    example: 10000.0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '最大价值必须是数字' })
  @Min(0, { message: '最大价值不能小于0' })
  @Type(() => Number)
  valueMax?: number;

  @ApiProperty({
    description: '排序字段',
    example: 'currentStock',
    enum: ['', 'materialName', 'currentStock', 'stockValue', 'updatedAt'],
    required: false,
    default: 'updatedAt',
  })
  @IsOptional()
  @IsEnum(['', 'materialName', 'currentStock', 'stockValue', 'updatedAt'], {
    message: '排序字段只能是materialName、currentStock、stockValue、updatedAt',
  })
  sortBy?: string = 'updatedAt';

  @ApiProperty({
    description: '排序方向',
    example: 'desc',
    enum: ['', 'asc', 'desc'],
    required: false,
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: '排序方向只能是asc或desc' })
  sortOrder?: string = 'desc';
}
