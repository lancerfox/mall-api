import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

// 辅助函数：将空字符串转换为 undefined
const emptyStringToUndefined = ({ value }: { value: unknown }) =>
  value === '' ? undefined : value;

// 辅助函数：安全地将值转换为整数
const safeTransformToInt = ({
  value,
}: {
  value: unknown;
}): number | undefined => {
  // 忽略 null, undefined 和空字符串
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  // 如果是数字，直接取整
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.floor(value);
  }

  // 如果是字符串，尝试解析
  if (typeof value === 'string') {
    const num = parseInt(value, 10);
    // 如果解析结果不是数字（比如非数字字符串解析后是NaN），则返回 undefined
    return isNaN(num) ? undefined : num;
  }

  // 其他类型不支持转换，返回 undefined
  return undefined;
};

export class ProductListFilters {
  @ApiPropertyOptional({
    description: '商品名称',
    example: '沉香',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString({ message: '商品名称必须是字符串' })
  name?: string;

  @ApiPropertyOptional({
    description: '商品ID',
    example: '507f1f77bcf86cd799439011',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString({ message: '商品ID必须是字符串' })
  id?: string;

  @ApiPropertyOptional({
    description: '分类ID',
    example: '507f1f77bcf86cd799439011',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString({ message: '分类ID必须是字符串' })
  categoryId?: string;

  @ApiPropertyOptional({
    description: '商品状态',
    example: 'Draft',
    enum: ['Draft', 'On-shelf', 'Off-shelf'],
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString({ message: '商品状态必须是字符串' })
  @IsIn(['Draft', 'On-shelf', 'Off-shelf'], {
    message: '商品状态只能是Draft、On-shelf或Off-shelf',
  })
  status?: string;
}

export class ProductListDto {
  @ApiProperty({
    description: '页码',
    example: 1,
    minimum: 1,
    type: Number,
  })
  @Transform(safeTransformToInt)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码不能小于1' })
  page: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 10,
    minimum: 1,
    type: Number,
  })
  @Transform(safeTransformToInt)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量不能小于1' })
  pageSize: number = 10;

  @ApiPropertyOptional({
    description: '筛选条件',
    type: ProductListFilters,
  })
  @IsOptional()
  filters?: ProductListFilters;
}
