import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsArray,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 更新用户数据传输对象
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: '用户角色',
    example: 'admin',
    enum: ['admin', 'super_admin', 'operator'],
  })
  @IsOptional()
  @IsEnum(['admin', 'super_admin', 'operator'])
  role?: string;

  @ApiPropertyOptional({
    description: '用户状态',
    example: 'active',
    enum: ['active', 'inactive', 'locked'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'locked'])
  status?: string;

  @ApiPropertyOptional({
    description: '头像URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    description: '用户权限列表',
    example: ['user:read', 'user:write'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({
    description: '新密码',
    example: 'newpassword123',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
