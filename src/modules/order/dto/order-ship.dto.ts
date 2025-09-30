import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class OrderShipDto {
  @ApiProperty({
    description: '订单ID',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: '订单ID不能为空' })
  @IsString({ message: '订单ID必须为字符串格式' })
  id: string;

  @ApiProperty({
    description: '物流公司名称',
    required: true,
    example: '顺丰快递',
  })
  @IsNotEmpty({ message: '物流公司名称不能为空' })
  @IsString({ message: '物流公司名称必须为字符串格式' })
  @Length(2, 50, { message: '物流公司名称长度必须在2-50个字符之间' })
  shipping_company: string;

  @ApiProperty({
    description: '物流单号',
    required: true,
    example: 'SF1234567890',
  })
  @IsNotEmpty({ message: '物流单号不能为空' })
  @IsString({ message: '物流单号必须为字符串格式' })
  @Length(5, 50, { message: '物流单号长度必须在5-50个字符之间' })
  @Matches(/^[A-Za-z0-9]+$/, { message: '物流单号只能包含字母和数字' })
  tracking_number: string;
}
