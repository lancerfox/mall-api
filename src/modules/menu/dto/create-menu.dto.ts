import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({
    description: '父级菜单ID',
    required: false,
    example: '507f1f77-bc11-1cd7-9943-9011bcf86cd7',
  })
  @IsOptional()
  @IsUUID('4', { message: '父级菜单ID格式不正确' })
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
    description: '菜单标题(meta.title)',
    required: false,
    example: '系统管理',
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({
    description: '菜单图标(meta.icon)',
    required: false,
    example: 'carbon:settings',
  })
  @IsOptional()
  @IsString()
  metaIcon?: string;

  @ApiProperty({
    description: '是否在菜单中隐藏(meta.hidden)',
    required: false,
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  metaHidden?: boolean;

  @ApiProperty({
    description: '如果设置为true，将始终显示根菜单(meta.alwaysShow)',
    required: false,
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  metaAlwaysShow?: boolean;

  @ApiProperty({
    description: '排序顺序',
    required: false,
    default: 0,
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
