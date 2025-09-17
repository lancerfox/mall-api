import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 登录数据传输对象
 */
export class LoginDto {
  @ApiProperty({
    description: '用户名',
    example: 'admin',
    minLength: 3,
    maxLength: 20,
    required: true,
  })
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(3, { message: '用户名长度至少3位' })
  @MaxLength(20, { message: '用户名长度不能超过20位' })
  username!: string;

  @ApiProperty({
    description: '密码',
    example: 'Password123!',
    minLength: 1,
    maxLength: 50,
    required: true,
  })
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(1, { message: '密码不能为空' })
  @MaxLength(50, { message: '密码长度不能超过50位' })
  password!: string;
}
