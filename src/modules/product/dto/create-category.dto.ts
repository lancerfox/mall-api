import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsMongoId,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: '上级分类ID，一级分类为null',
    example: null,
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @ApiProperty({ description: '分类名称', example: '沉香手串', required: true })
  @IsNotEmpty({ message: '分类名称不能为空' })
  @IsString({ message: '分类名称必须是字符串' })
  name: string;

  @ApiProperty({ description: '分类编码', example: 'INCENSE', required: true })
  @IsNotEmpty({ message: '分类编码不能为空' })
  @IsString({ message: '分类编码必须是字符串' })
  code: string;

  @ApiProperty({
    description: '分类图标URL',
    example: 'https://example.com/icon.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '图标必须是字符串' })
  icon?: string;

  @ApiProperty({ description: '排序号', example: 0, required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序号必须是数字' })
  sort?: number;

  @ApiProperty({
    description: '是否启用',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '启用状态必须是布尔值' })
  enabled?: boolean;
}
