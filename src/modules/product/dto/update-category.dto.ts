import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  IsMongoId,
} from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    description: '分类ID',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsNotEmpty({ message: '分类ID不能为空' })
  @IsMongoId({ message: '分类ID格式不正确' })
  id: string;

  @ApiProperty({
    description: '上级分类ID',
    example: null,
    required: false,
  })
  @IsOptional()
  @IsMongoId({ message: '上级分类ID格式不正确' })
  parentId?: string;

  @ApiProperty({
    description: '分类名称',
    example: '沉香手串',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '分类名称必须是字符串' })
  name?: string;

  @ApiProperty({
    description: '分类编码',
    example: 'INCENSE',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '分类编码必须是字符串' })
  code?: string;

  @ApiProperty({
    description: '分类图标URL',
    example: 'https://example.com/icon.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '图标必须是字符串' })
  icon?: string;

  @ApiProperty({
    description: '排序号',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '排序号必须是数字' })
  sort?: number;

  @ApiProperty({
    description: '状态 (0: 隐藏, 1: 显示)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  @IsIn([0, 1], { message: '状态只能是0或1' })
  status?: number;
}
