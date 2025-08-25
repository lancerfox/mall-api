import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsObject,
  ValidateNested,
  MinLength,
  MaxLength,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class MenuMetaDto {
  @ApiProperty({
    description: '菜单标题',
    example: '用户管理',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

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
 * 创建菜单数据传输对象
 */
export class CreateMenuDto {
  @ApiProperty({
    description: '菜单标题',
    example: '用户管理',
  })
  @IsString({ message: '菜单标题必须是字符串' })
  @IsNotEmpty({ message: '菜单标题不能为空' })
  @MinLength(2, { message: '菜单标题长度至少2位' })
  @MaxLength(20, { message: '菜单标题长度不能超过20位' })
  title: string;

  @ApiProperty({
    description: '菜单名称（唯一标识）',
    example: 'UserManagement',
  })
  @IsString({ message: '菜单名称必须是字符串' })
  @IsNotEmpty({ message: '菜单名称不能为空' })
  @MinLength(2, { message: '菜单名称长度至少2位' })
  @MaxLength(50, { message: '菜单名称长度不能超过50位' })
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
    message: '菜单名称必须以字母开头，只能包含字母、数字和下划线',
  })
  name: string;

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
  @IsNumber({}, { message: '排序号必须是数字' })
  @Min(0, { message: '排序号不能小于0' })
  @Max(9999, { message: '排序号不能大于9999' })
  sort?: number;

  @ApiProperty({
    description: '菜单类型',
    example: 'menu',
    enum: ['menu', 'button', 'page'],
  })
  @IsEnum(['menu', 'button', 'page'], {
    message: '菜单类型必须是menu、button或page之一',
  })
  type: string;

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
