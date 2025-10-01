import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { transformDateString } from '../../../common/utils/date-parser';

// 辅助函数：将空字符串转换为 undefined
const emptyStringToUndefined = ({ value }: { value: unknown }) =>
  value === '' ? undefined : value;

// 辅助函数：安全地将值转换为整数
const safeTransformToInt = ({
  value,
}: {
  value: unknown;
}): number | undefined => {
  // 忽略 null, undefined 和空字符串
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  // 如果是数字，直接取整
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.floor(value);
  }

  // 如果是字符串，尝试解析
  if (typeof value === 'string') {
    const num = parseInt(value, 10);
    // 如果解析结果不是数字（比如非数字字符串解析后是NaN），则返回 undefined
    return isNaN(num) ? undefined : num;
  }

  // 其他类型不支持转换，返回 undefined
  return undefined;
};

export class OrderListQueryDto {
  @ApiPropertyOptional({
    description: '订单编号',
    example: 'ORD202509290001',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString()
  order_number?: string;

  @ApiPropertyOptional({
    description: '收货人信息（姓名或手机号）',
    example: '张三',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString()
  receiver_info?: string;

  @ApiPropertyOptional({
    description: '订单状态',
    enum: OrderStatus,
    example: OrderStatus.TO_BE_SHIPPED,
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: '下单时间范围-开始时间',
    example: '2025-09-29 00:00:00',
  })
  @Transform(transformDateString)
  @IsOptional()
  @IsDateString()
  start_time?: string;

  @ApiPropertyOptional({
    description: '下单时间范围-结束时间',
    example: '2025-09-29 23:59:59',
  })
  @Transform(transformDateString)
  @IsOptional()
  @IsDateString()
  end_time?: string;

  @ApiPropertyOptional({
    description: '页码',
    example: 1,
    minimum: 1,
    type: Number,
  })
  @Transform(safeTransformToInt)
  @IsOptional()
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码不能小于1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    minimum: 1,
    type: Number,
  })
  @Transform(safeTransformToInt)
  @IsOptional()
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量不能小于1' })
  pageSize?: number = 10;
}
