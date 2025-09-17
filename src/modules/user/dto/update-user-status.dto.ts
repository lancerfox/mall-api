import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 更新用户状态数据传输对象
 */
export class UpdateUserStatusDto {
  @ApiProperty({
    description: '用户状态',
    example: 'active',
    enum: ['active', 'inactive', 'locked'],
    required: true,
  })
  @IsEnum(['active', 'inactive', 'locked'])
  @IsNotEmpty()
  status: string;
}
