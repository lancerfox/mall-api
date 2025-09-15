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
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCategoryDto {
  @IsString({ message: '分类名称必须是字符串' })
  @IsNotEmpty({ message: '分类名称不能为空' })
  @MaxLength(100, { message: '分类名称长度不能超过100个字符' })
  @Matches(/^[\u4e00-\u9fa5a-zA-Z0-9\s\-_()（）]+$/, {
    message: '分类名称只能包含中文、英文、数字、空格、连字符、下划线和括号',
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional()
  @IsMongoId({ message: '父级分类ID格式不正确' })
  parent_id?: string;

  @IsOptional()
  @IsString({ message: '分类描述必须是字符串' })
  @MaxLength(500, { message: '分类描述不能超过500个字符' })
  @Transform(({ value }) => value?.trim() || '')
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: '排序顺序必须是数字' })
  @Min(0, { message: '排序顺序不能小于0' })
  @Max(9999, { message: '排序顺序不能大于9999' })
  @IsInt({ message: '排序顺序必须是整数' })
  @Type(() => Number)
  sort_order?: number;
}
