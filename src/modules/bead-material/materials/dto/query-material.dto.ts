import {
  IsOptional,
  IsMongoId,
  IsString,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryMaterialDto {
  @IsOptional()
  @IsMongoId({ message: '分类ID格式不正确' })
  category_id?: string;

  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  @MaxLength(200, { message: '关键词不能超过200个字符' })
  @Transform(({ value }) => value?.trim())
  keyword?: string;

  @IsOptional()
  @IsBoolean({ message: '启用状态必须是布尔值' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  is_active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  limit?: number;
}
