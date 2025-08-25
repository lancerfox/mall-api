import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 更新用户权限数据传输对象
 */
export class UpdatePermissionsDto {
  @ApiProperty({
    description: '权限列表',
    example: ['user:read', 'user:write', 'menu:read'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
