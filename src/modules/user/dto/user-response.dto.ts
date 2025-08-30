import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleResponseDto } from '../../role/dto/role-response.dto';

/**
 * 用户响应数据传输对象
 */
export class UserResponseDto {
  @ApiProperty({
    description: '用户ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: '用户名',
    example: 'admin',
  })
  username: string;

  @ApiProperty({
    description: '用户角色',
    type: [RoleResponseDto],
  })
  roles: RoleResponseDto[];

  @ApiProperty({
    description: '用户状态',
    example: 'active',
    enum: ['active', 'inactive', 'locked'],
  })
  status: string;

  @ApiPropertyOptional({
    description: '头像URL',
    example: 'https://example.com/avatar.jpg',
  })
  avatar?: string;

  @ApiPropertyOptional({
    description: '最后登录时间',
    example: '2023-01-01T00:00:00.000Z',
  })
  lastLoginTime?: Date;

  @ApiPropertyOptional({
    description: '最后登录IP',
    example: '192.168.1.1',
  })
  lastLoginIp?: string;

  @ApiProperty({
    description: '用户权限列表',
    example: ['user:read', 'user:write'],
    type: [String],
  })
  permissions: string[];

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

  @ApiProperty({
    description: '是否是超级管理员',
    example: true,
  })
  isSuperAdmin: boolean;
}
