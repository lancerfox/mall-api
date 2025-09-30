import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  Length,
  ValidateIf,
} from 'class-validator';
import { OrderCloseReason } from '../../../common/enums/order-status.enum';

export class OrderCloseDto {
  @ApiProperty({
    description: '订单ID',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: '订单ID不能为空' })
  @IsString({ message: '订单ID必须为字符串格式' })
  id: string;

  @ApiProperty({
    description: '关闭原因',
    enum: OrderCloseReason,
    required: true,
    example: OrderCloseReason.TIMEOUT_UNPAID,
  })
  @IsNotEmpty({ message: '关闭原因不能为空' })
  @IsEnum(OrderCloseReason, { message: '关闭原因必须为预定义枚举值' })
  close_reason: OrderCloseReason;

  @ApiProperty({
    description: '关闭备注',
    required: false,
    example: '订单超时未支付自动关闭',
  })
  @IsOptional()
  @IsString({ message: '关闭备注必须为字符串格式' })
  @Length(0, 200, { message: '关闭备注长度不能超过200个字符' })
  @ValidateIf(
    (o: OrderCloseDto) => o.close_reason === OrderCloseReason.OTHER_REASON,
    {
      message: '当关闭原因为OTHER_REASON时，关闭备注为必填项',
    },
  )
  @IsNotEmpty({
    message: '当关闭原因为OTHER_REASON时，关闭备注不能为空',
  })
  close_remark?: string;
}
