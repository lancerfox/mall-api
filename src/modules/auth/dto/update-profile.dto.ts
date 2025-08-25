import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

/**
 * 更新用户资料数据传输对象
 */
export class UpdateProfileDto {
  @ApiProperty({
    description: '邮箱',
    example: 'admin@example.com',
  })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({
    description: '真实姓名',
    example: '系统管理员',
  })
  @IsString({ message: '真实姓名必须是字符串' })
  @Length(1, 50, { message: '真实姓名长度必须在1-50个字符之间' })
  realName: string;

  @ApiProperty({
    description: '手机号',
    example: '13800138000',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiProperty({
    description: '头像URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatar?: string;
}
