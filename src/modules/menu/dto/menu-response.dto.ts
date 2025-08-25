import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class MenuMetaResponseDto {
  @ApiProperty({
    description: '菜单标题',
    example: '用户管理',
  })
  title: string;

  @ApiPropertyOptional({
    description: '菜单图标',
    example: 'user',
  })
  icon?: string;

  @ApiPropertyOptional({
    description: '是否不缓存',
    example: false,
  })
  noCache?: boolean;

  @ApiPropertyOptional({
    description: '是否显示面包屑',
    example: true,
  })
  breadcrumb?: boolean;

  @ApiPropertyOptional({
    description: '是否固定在标签页',
    example: false,
  })
  affix?: boolean;
}

/**
 * 菜单响应数据传输对象
 */
export class MenuResponseDto {
  @ApiProperty({
    description: '菜单ID',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: '菜单标题',
    example: '用户管理',
  })
  title: string;

  @ApiProperty({
    description: '菜单名称（唯一标识）',
    example: 'UserManagement',
  })
  name: string;

  @ApiPropertyOptional({
    description: '菜单路径',
    example: '/system/user',
  })
  path?: string;

  @ApiPropertyOptional({
    description: '组件路径',
    example: 'system/user/index',
  })
  component?: string;

  @ApiPropertyOptional({
    description: '菜单图标',
    example: 'user',
  })
  icon?: string;

  @ApiPropertyOptional({
    description: '父菜单ID',
    example: '507f1f77bcf86cd799439011',
  })
  parentId?: string;

  @ApiProperty({
    description: '排序号',
    example: 1,
  })
  sort: number;

  @ApiProperty({
    description: '菜单类型',
    example: 'menu',
    enum: ['menu', 'button', 'page'],
  })
  type: string;

  @ApiProperty({
    description: '菜单状态',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status: string;

  @ApiPropertyOptional({
    description: '权限标识',
    example: 'system:user:list',
  })
  permission?: string;

  @ApiProperty({
    description: '是否隐藏',
    example: false,
  })
  hidden: boolean;

  @ApiProperty({
    description: '是否缓存',
    example: true,
  })
  keepAlive: boolean;

  @ApiPropertyOptional({
    description: '重定向路径',
    example: '/system/user/list',
  })
  redirect?: string;

  @ApiPropertyOptional({
    description: '菜单元数据',
    type: MenuMetaResponseDto,
  })
  meta?: MenuMetaResponseDto;

  @ApiPropertyOptional({
    description: '子菜单列表',
    type: [MenuResponseDto],
  })
  children?: MenuResponseDto[];

  @ApiProperty({
    description: '创建时间',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '更新时间',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

/**
 * 菜单树节点响应数据传输对象
 */
export class MenuTreeNodeDto {
  @ApiProperty({
    description: '菜单ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: '菜单标题',
    example: '用户管理',
  })
  title: string;

  @ApiProperty({
    description: '菜单名称（唯一标识）',
    example: 'UserManagement',
  })
  name: string;

  @ApiPropertyOptional({
    description: '菜单路径',
    example: '/system/user',
  })
  path?: string;

  @ApiPropertyOptional({
    description: '菜单图标',
    example: 'user',
  })
  icon?: string;

  @ApiProperty({
    description: '排序号',
    example: 1,
  })
  sort: number;

  @ApiProperty({
    description: '菜单类型',
    example: 'menu',
    enum: ['menu', 'button', 'page'],
  })
  type: string;

  @ApiProperty({
    description: '菜单状态',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status: string;

  @ApiPropertyOptional({
    description: '子菜单列表',
    type: [MenuTreeNodeDto],
  })
  children?: MenuTreeNodeDto[];
}
