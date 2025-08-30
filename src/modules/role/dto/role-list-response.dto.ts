import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from '../../../common/enums/role-type.enum';

/**
 * 角色列表响应数据传输对象（不包含权限信息）
 */
export class RoleListResponseDto {
  @ApiProperty({
    description: '角色ID',
    example: '60d21b4667d0d8992e610c85',
  })
  id: string;

  @ApiProperty({
    description: '角色名称',
    example: 'ProductManager',
  })
  name: string;

  @ApiProperty({
    description: '角色类型',
    enum: RoleType,
    example: RoleType.OPERATOR,
  })
  type: RoleType;

  @ApiProperty({
    description: '角色描述',
    example: '产品管理员，负责管理商品',
  })
  description: string;

  @ApiProperty({
    description: '角色状态',
    enum: ['active', 'inactive'],
    example: 'active',
  })
  status: string;

  @ApiProperty({
    description: '是否为系统角色',
    example: false,
  })
  isSystem: boolean;

  @ApiProperty({
    description: '创建时间',
    example: '2023-08-29T15:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '更新时间',
    example: '2023-08-29T15:00:00.000Z',
  })
  updatedAt: Date;
}
