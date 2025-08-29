import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 更新用户数据传输对象
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: '用户角色ID列表',
    example: ['60f1b2b3b3b3b3b3b3b3b3b3'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

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
}
