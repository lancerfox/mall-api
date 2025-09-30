import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsNumberString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { OrderStatus } from '../../../common/enums/order-status.enum';

export class OrderListQueryDto {
  @ApiProperty({
    description: '订单编号',
    required: false,
    example: 'ORD202509290001',
  })
  @IsOptional()
  @IsString()
  order_number?: string;

  @ApiProperty({
    description: '收货人信息（姓名或手机号）',
    required: false,
    example: '张三',
  })
  @IsOptional()
  @IsString()
  receiver_info?: string;

  @ApiProperty({
    description: '订单状态',
    enum: OrderStatus,
    required: false,
    example: OrderStatus.TO_BE_SHIPPED,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({
    description: '下单时间范围-开始时间',
    required: false,
    example: '2025-09-29T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  start_time?: string;

  @ApiProperty({
    description: '下单时间范围-结束时间',
    required: false,
    example: '2025-09-29T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  end_time?: string;

  @ApiProperty({
    description: '页码',
    required: false,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(String(value), 10) || 1)
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    required: false,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(String(value), 10) || 10)
  pageSize?: number = 10;
}
