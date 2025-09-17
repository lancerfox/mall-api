import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建用户数据传输对象
 */
export class CreateUserDto {
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
  // @Matches(/^[a-zA-Z0-9_]+$/, { message: '用户名只能包含字母、数字和下划线' })
  username: string;

  @ApiProperty({
    description: '密码',
    example: 'Password123!',
    minLength: 8,
    maxLength: 50,
    required: true,
  })
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(8, { message: '密码长度至少8位' })
  @MaxLength(50, { message: '密码长度不能超过50位' })
  // @Matches(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
  //   {
  //     message:
  //       '密码必须包含至少一个大写字母、一个小写字母、一个数字和一个特殊字符',
  //   },
  // )
  password: string;

  @ApiPropertyOptional({
    description: '用户角色ID列表',
    example: ['60f1b2b3b3b3b3b3b3b3b3b3'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: '角色列表必须是数组' })
  @IsString({ each: true, message: '角色ID必须是字符串' })
  roles?: string[];

  @ApiPropertyOptional({
    description: '头像URL',
    example: 'https://example.com/avatar.jpg',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  @IsUrl({}, { message: '头像URL格式不正确' })
  @MaxLength(500, { message: '头像URL长度不能超过500位' })
  avatar?: string;
}
