import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class MenuMetaDto {
  @ApiPropertyOptional({
    description: '菜单标题',
    example: '用户管理',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: '菜单图标',
    example: 'user',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: '是否不缓存',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  noCache?: boolean;

  @ApiPropertyOptional({
    description: '是否显示面包屑',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  breadcrumb?: boolean;

  @ApiPropertyOptional({
    description: '是否固定在标签页',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  affix?: boolean;
}

/**
 * 更新菜单数据传输对象
 */
export class UpdateMenuDto {
  @ApiPropertyOptional({
    description: '菜单标题',
    example: '用户管理',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: '菜单名称（唯一标识）',
    example: 'UserManagement',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: '菜单路径',
    example: '/system/user',
  })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({
    description: '组件路径',
    example: 'system/user/index',
  })
  @IsOptional()
  @IsString()
  component?: string;

  @ApiPropertyOptional({
    description: '菜单图标',
    example: 'user',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: '父菜单ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({
    description: '排序号',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiPropertyOptional({
    description: '菜单类型',
    example: 'menu',
    enum: ['menu', 'button', 'page'],
  })
  @IsOptional()
  @IsEnum(['menu', 'button', 'page'])
  type?: string;

  @ApiPropertyOptional({
    description: '菜单状态',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @ApiPropertyOptional({
    description: '权限标识',
    example: 'system:user:list',
  })
  @IsOptional()
  @IsString()
  permission?: string;

  @ApiPropertyOptional({
    description: '是否隐藏',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @ApiPropertyOptional({
    description: '是否缓存',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  keepAlive?: boolean;

  @ApiPropertyOptional({
    description: '重定向路径',
    example: '/system/user/list',
  })
  @IsOptional()
  @IsString()
  redirect?: string;

  @ApiPropertyOptional({
    description: '菜单元数据',
    type: MenuMetaDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MenuMetaDto)
  meta?: MenuMetaDto;
}
