import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 密码验证数据传输对象
 */
export class ValidatePasswordDto {
  @ApiProperty({
    description: '待验证的密码',
    example: 'MyPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

/**
 * 密码强度验证响应
 */
export class PasswordStrengthResponseDto {
  @ApiProperty({
    description: '密码是否符合要求',
    example: true,
  })
  isValid: boolean;

  @ApiProperty({
    description: '错误信息列表',
    example: [],
    type: [String],
  })
  errors: string[];

  @ApiProperty({
    description: '密码强度评分（0-100）',
    example: 85,
  })
  score: number;
}
