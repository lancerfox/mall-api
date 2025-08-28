import { ApiProperty } from '@nestjs/swagger';
import { RoleResponseDto } from '../../role/dto/role-response.dto';

/**
 * 用户信息数据传输对象
 */
export class UserInfoDto {
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
    enum: ['active', 'inactive', 'locked'],
    example: 'active',
  })
  status: string;

  @ApiProperty({
    description: '头像URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatar?: string;

  @ApiProperty({
    description: '用户权限列表',
    type: [String],
    example: ['user:read', 'user:write', 'menu:read'],
  })
  permissions: string[];

  @ApiProperty({
    description: '最后登录时间',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  lastLoginTime?: Date;

  @ApiProperty({
    description: '最后登录IP',
    example: '192.168.1.1',
    required: false,
  })
  lastLoginIp?: string;
}

/**
 * 认证响应数据传输对象
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT访问令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: '用户信息',
    type: UserInfoDto,
  })
  user: UserInfoDto;

  @ApiProperty({
    description: '令牌过期时间（秒）',
    example: 3600,
  })
  expires_in: number;
}
