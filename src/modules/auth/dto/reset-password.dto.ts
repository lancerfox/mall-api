import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: '用户ID', example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  id: string;
}
