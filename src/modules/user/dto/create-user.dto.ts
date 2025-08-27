import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  // IsEmail,
  IsOptional,
  IsEnum,
  IsArray,
  // Matches,
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

  @ApiProperty({
    description: '用户角色',
    example: 'admin',
    enum: ['admin', 'super_admin', 'operator'],
  })
  @IsEnum(['admin', 'super_admin', 'operator'], {
    message: '用户角色必须是admin、super_admin或operator之一',
  })
  role: string;

  @ApiPropertyOptional({
    description: '头像URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  @IsUrl({}, { message: '头像URL格式不正确' })
  @MaxLength(500, { message: '头像URL长度不能超过500位' })
  avatar?: string;

  @ApiPropertyOptional({
    description: '用户权限列表',
    example: ['user:read', 'user:write'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: '权限列表必须是数组' })
  @IsString({ each: true, message: '权限项必须是字符串' })
  permissions?: string[];
}
