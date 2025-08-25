import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 重置密码数据传输对象
 */
export class ResetPasswordDto {
  @ApiProperty({
    description: '新密码',
    example: 'newpassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiPropertyOptional({
    description: '是否发送邮件通知',
    example: true,
  })
  @IsOptional()
  sendEmail?: boolean = false;
}
