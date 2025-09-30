import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OrderDetailQueryDto {
  @ApiProperty({
    description: '订单ID',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: '订单ID不能为空' })
  @IsString({ message: '订单ID必须为字符串格式' })
  id: string;
}
