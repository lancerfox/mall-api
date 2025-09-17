import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: '用户ID',
    example: '60f1b2b3b3b3b3b3b3b3b3b3',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
