import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class OrderModifyAddressDto {
  @ApiProperty({
    description: '订单ID',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: '订单ID不能为空' })
  @IsString({ message: '订单ID必须为字符串格式' })
  id: string;

  @ApiProperty({
    description: '收货人姓名',
    required: true,
    example: '张三',
  })
  @IsNotEmpty({ message: '收货人姓名不能为空' })
  @IsString({ message: '收货人姓名必须为字符串格式' })
  @Length(2, 20, { message: '收货人姓名长度必须在2-20个字符之间' })
  @Matches(/^[\u4e00-\u9fa5a-zA-Z0-9]+$/, {
    message: '收货人姓名只能包含中文、英文字母和数字',
  })
  name: string;

  @ApiProperty({
    description: '收货人电话',
    required: true,
    example: '13800138000',
  })
  @IsNotEmpty({ message: '收货人电话不能为空' })
  @IsString({ message: '收货人电话必须为字符串格式' })
  @Matches(/^1[3-9]\d{9}$/, { message: '收货人电话格式不正确' })
  phone: string;

  @ApiProperty({
    description: '详细收货地址',
    required: true,
    example: '北京市海淀区xxx街道xxx号',
  })
  @IsNotEmpty({ message: '详细收货地址不能为空' })
  @IsString({ message: '详细收货地址必须为字符串格式' })
  @Length(5, 200, { message: '详细收货地址长度必须在5-200个字符之间' })
  address: string;
}
