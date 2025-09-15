import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsNumber,
  Min,
  Max,
  IsInt,
  MaxLength,
  Matches,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateMaterialDto {
  @IsString({ message: '材料名称必须是字符串' })
  @IsNotEmpty({ message: '材料名称不能为空' })
  @MaxLength(100, { message: '材料名称长度不能超过100个字符' })
  @Matches(/^[\u4e00-\u9fa5a-zA-Z0-9\s\-_()（）]+$/, {
    message: '材料名称只能包含中文、英文、数字、空格、连字符、下划线和括号',
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsMongoId({ message: '分类ID格式不正确' })
  @IsNotEmpty({ message: '分类ID不能为空' })
  category_id: string;

  @IsOptional()
  @IsString({ message: '规格必须是字符串' })
  @MaxLength(50, { message: '规格不能超过50个字符' })
  @Transform(({ value }) => value?.trim() || '')
  specification?: string;

  @IsOptional()
  @IsString({ message: '颜色必须是字符串' })
  @MaxLength(50, { message: '颜色不能超过50个字符' })
  @Transform(({ value }) => value?.trim() || '')
  color?: string;

  @IsOptional()
  @IsString({ message: '尺寸必须是字符串' })
  @MaxLength(50, { message: '尺寸不能超过50个字符' })
  @Transform(({ value }) => value?.trim() || '')
  size?: string;

  @IsOptional()
  @IsString({ message: '单位必须是字符串' })
  @MaxLength(50, { message: '单位不能超过50个字符' })
  @Transform(({ value }) => value?.trim() || '')
  unit?: string;

  @IsOptional()
  @IsNumber({}, { message: '库存数量必须是数字' })
  @Min(0, { message: '库存数量不能小于0' })
  @Max(999999, { message: '库存数量不能大于999999' })
  @IsInt({ message: '库存数量必须是整数' })
  @Type(() => Number)
  stock_quantity?: number;

  @IsOptional()
  @IsNumber({}, { message: '最小库存必须是数字' })
  @Min(0, { message: '最小库存不能小于0' })
  @Max(999999, { message: '最小库存不能大于999999' })
  @IsInt({ message: '最小库存必须是整数' })
  @Type(() => Number)
  min_stock?: number;

  @IsOptional()
  @IsNumber({}, { message: '最大库存必须是数字' })
  @Min(0, { message: '最大库存不能小于0' })
  @Max(999999, { message: '最大库存不能大于999999' })
  @IsInt({ message: '最大库存必须是整数' })
  @Type(() => Number)
  max_stock?: number;

  @IsOptional()
  @IsNumber({}, { message: '采购价格必须是数字' })
  @Min(0, { message: '采购价格不能小于0' })
  @Max(999999, { message: '采购价格不能大于999999' })
  @Type(() => Number)
  purchase_price?: number;

  @IsOptional()
  @IsNumber({}, { message: '销售价格必须是数字' })
  @Min(0, { message: '销售价格不能小于0' })
  @Max(999999, { message: '销售价格不能大于999999' })
  @Type(() => Number)
  selling_price?: number;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  @MaxLength(500, { message: '描述不能超过500个字符' })
  @Transform(({ value }) => value?.trim() || '')
  description?: string;
}
