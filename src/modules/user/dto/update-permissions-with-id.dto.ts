import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class UpdatePermissionsWithIdDto {
  @ApiProperty({
    description: '用户ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: '权限列表',
    example: ['user:read', 'user:create'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
