import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Length,
  Matches,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

/**
 * 修改密码数据传输对象
 */
export class ChangePasswordDto {
  @ApiProperty({
    description: '当前密码',
    example: 'currentPassword123',
  })
  @IsString({ message: '当前密码必须是字符串' })
  @IsNotEmpty({ message: '当前密码不能为空' })
  @MaxLength(50, { message: '当前密码长度不能超过50位' })
  currentPassword: string;

  @ApiProperty({
    description: '新密码',
    example: 'newPassword123!',
  })
  @IsString({ message: '新密码必须是字符串' })
  @Length(8, 32, { message: '新密码长度必须在8-32个字符之间' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      '新密码必须包含至少一个小写字母、一个大写字母、一个数字和一个特殊字符',
  })
  newPassword: string;

  @ApiProperty({
    description: '确认新密码',
    example: 'newPassword123!',
  })
  @IsString({ message: '确认密码必须是字符串' })
  @IsNotEmpty({ message: '确认密码不能为空' })
  @MaxLength(50, { message: '确认密码长度不能超过50位' })
  confirmPassword: string;
}
