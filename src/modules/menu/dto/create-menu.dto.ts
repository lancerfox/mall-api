import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsMongoId,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ description: '父级菜单ID', required: false })
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @ApiProperty({ description: '菜单路径', example: '/system' })
  @IsString()
  path: string;

  @ApiProperty({ description: '菜单名称', example: 'System' })
  @IsString()
  name: string;

  @ApiProperty({
    description: '组件路径',
    required: false,
    example: 'views/System/index',
  })
  @IsOptional()
  @IsString()
  component?: string;

  @ApiProperty({
    description: '重定向路径',
    required: false,
    example: '/system/user',
  })
  @IsOptional()
  @IsString()
  redirect?: string;

  @ApiProperty({
    description: '菜单标题',
    required: false,
    example: '系统管理',
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({
    description: '菜单图标',
    required: false,
    example: 'carbon:settings',
  })
  @IsOptional()
  @IsString()
  metaIcon?: string;

  @ApiProperty({ description: '是否隐藏', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  metaHidden?: boolean;

  @ApiProperty({ description: '是否始终显示', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  metaAlwaysShow?: boolean;

  @ApiProperty({ description: '排序顺序', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
