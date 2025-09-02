import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class MenuResponseDto {
  @ApiProperty({ description: '菜单ID' })
  id: string;

  @ApiProperty({ description: '父级菜单ID', required: false })
  parentId?: string;

  @ApiProperty({ description: '菜单路径' })
  path: string;

  @ApiProperty({ description: '菜单名称' })
  name: string;

  @ApiProperty({ description: '组件路径', required: false })
  component?: string;

  @ApiProperty({ description: '重定向路径', required: false })
  redirect?: string;

  @ApiProperty({ description: '菜单元数据' })
  meta: {
    title?: string;
    icon?: string;
    hidden?: boolean;
    alwaysShow?: boolean;
  };

  @ApiProperty({ description: '排序顺序' })
  sortOrder: number;

  @ApiProperty({ description: '状态：active-启用，inactive-禁用' })
  status: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;

  @ApiProperty({ description: '更新时间' })
  updatedAt: string;

  @ApiProperty({
    description: '子菜单',
    type: [MenuResponseDto],
    required: false,
  })
  children?: MenuResponseDto[];
}

export class MenuListResponseDto {
  @ApiProperty({ description: '菜单列表', type: [MenuResponseDto] })
  data: MenuResponseDto[];
}

export class MenuDetailResponseDto {
  @ApiProperty({ description: '菜单详情' })
  data: MenuResponseDto;
}

export class DeleteMenuRequestDto {
  @ApiProperty({ description: '菜单ID' })
  @IsMongoId()
  id: string;
}

export class MenuDetailRequestDto {
  @ApiProperty({ description: '菜单ID' })
  @IsMongoId()
  id: string;
}

export class MenuByRoleRequestDto {
  @ApiProperty({ description: '角色ID' })
  roleId: string;
}
