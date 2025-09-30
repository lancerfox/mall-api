import { ApiProperty } from '@nestjs/swagger';
import {
  OrderStatus,
  OrderCloseReason,
} from '../../../common/enums/order-status.enum';

export class OrderItemResponseDto {
  @ApiProperty({ description: '商品图片' })
  product_image: string;

  @ApiProperty({ description: '商品名称' })
  product_name: string;

  @ApiProperty({ description: 'SKU规格' })
  sku_spec: string;

  @ApiProperty({ description: '商品单价' })
  price: number;

  @ApiProperty({ description: '购买数量' })
  quantity: number;

  @ApiProperty({ description: '小计金额' })
  subtotal: number;
}

export class OrderListProductInfoDto {
  @ApiProperty({ description: '商品图片' })
  product_image: string;

  @ApiProperty({ description: '商品名称' })
  product_name: string;

  @ApiProperty({ description: 'SKU规格' })
  sku_spec: string;

  @ApiProperty({ description: '购买数量' })
  quantity: number;
}

export class OrderListItemResponseDto {
  @ApiProperty({ description: '订单ID' })
  id: string;

  @ApiProperty({ description: '订单编号' })
  order_number: string;

  @ApiProperty({ description: '客户姓名' })
  customer_name: string;

  @ApiProperty({ description: '客户电话' })
  customer_phone: string;

  @ApiProperty({ description: '订单总金额' })
  total_amount: number;

  @ApiProperty({ description: '订单状态' })
  status: OrderStatus;

  @ApiProperty({ description: '创建时间' })
  created_at: string;

  @ApiProperty({ description: '商品信息', type: [OrderListProductInfoDto] })
  product_info: OrderListProductInfoDto[];
}

export class OrderListResponseDto {
  @ApiProperty({ description: '订单列表', type: [OrderListItemResponseDto] })
  data: OrderListItemResponseDto[];

  @ApiProperty({ description: '总数量' })
  total: number;

  @ApiProperty({ description: '当前页码' })
  page: number;

  @ApiProperty({ description: '每页数量' })
  pageSize: number;

  @ApiProperty({ description: '总页数' })
  totalPages: number;
}

export class CustomerInfoDto {
  @ApiProperty({ description: '客户姓名' })
  name: string;

  @ApiProperty({ description: '客户电话' })
  phone: string;

  @ApiProperty({ description: '收货地址' })
  address: string;
}

export class PaymentInfoDto {
  @ApiProperty({ description: '支付方式' })
  method: string;

  @ApiProperty({ description: '第三方交易号' })
  transaction_id: string;

  @ApiProperty({ description: '支付状态' })
  status: string;
}

export class ShippingInfoDto {
  @ApiProperty({ description: '物流公司' })
  company: string;

  @ApiProperty({ description: '物流单号' })
  tracking_number: string;

  @ApiProperty({ description: '物流轨迹详情' })
  tracking_details: Array<{
    time: string;
    status: string;
  }>;
}

export class OperationLogDto {
  @ApiProperty({ description: '操作人' })
  operator: string;

  @ApiProperty({ description: '操作内容' })
  action: string;

  @ApiProperty({ description: '操作时间' })
  time: string;
}

export class OrderDetailResponseDto {
  @ApiProperty({ description: '订单ID' })
  id: string;

  @ApiProperty({ description: '订单编号' })
  order_number: string;

  @ApiProperty({ description: '订单状态' })
  status: OrderStatus;

  @ApiProperty({ description: '创建时间' })
  created_at: string;

  @ApiProperty({ description: '支付时间' })
  paid_at: string | null;

  @ApiProperty({ description: '发货时间' })
  shipped_at: string | null;

  @ApiProperty({ description: '客户信息' })
  customer_info: CustomerInfoDto;

  @ApiProperty({ description: '订单项', type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ description: '支付信息' })
  payment_info: PaymentInfoDto;

  @ApiProperty({ description: '物流信息' })
  shipping_info: ShippingInfoDto;

  @ApiProperty({ description: '订单备注' })
  remark: string;

  @ApiProperty({ description: '操作日志', type: [OperationLogDto] })
  operation_log: OperationLogDto[];
}

export class OrderShipResponseDto {
  @ApiProperty({ description: '订单ID' })
  id: string;

  @ApiProperty({ description: '订单编号' })
  order_number: string;

  @ApiProperty({ description: '订单状态' })
  status: OrderStatus;

  @ApiProperty({ description: '发货时间' })
  shipped_at: string;
}

export class OrderCloseResponseDto {
  @ApiProperty({ description: '订单ID' })
  id: string;

  @ApiProperty({ description: '订单编号' })
  order_number: string;

  @ApiProperty({ description: '订单状态' })
  status: OrderStatus;

  @ApiProperty({ description: '关闭原因' })
  close_reason: OrderCloseReason;

  @ApiProperty({ description: '关闭备注' })
  close_remark: string;
}

export class OrderModifyAddressResponseDto {
  @ApiProperty({ description: '订单ID' })
  id: string;

  @ApiProperty({ description: '订单编号' })
  order_number: string;

  @ApiProperty({ description: '客户信息' })
  customer_info: CustomerInfoDto;
}

export class OrderStatusDictionaryItemDto {
  @ApiProperty({ description: '状态值' })
  value: string;

  @ApiProperty({ description: '状态标签' })
  label: string;

  @ApiProperty({ description: '状态描述' })
  description: string;
}

export class OrderStatusDictionaryResponseDto {
  @ApiProperty({
    description: '状态字典',
    type: [OrderStatusDictionaryItemDto],
  })
  data: OrderStatusDictionaryItemDto[];
}
