import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UserIdBodyDto {
  @ApiProperty({
    description: '用户ID',
    example: '507f1f77-bc11-1cd7-9943-9011bcf86cd7',
    required: true,
  })
  @IsNotEmpty({ message: '用户ID不能为空' })
  @IsString({ message: '用户ID必须是字符串' })
  @IsUUID('4', { message: '用户ID格式不正确' })
  id: string;
}
