import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  Order,
  OrderItem,
  PaymentInfo,
  ShippingInfo,
  OrderOperationLog,
} from '../entities';
import { ProductSKU } from '../../product/entities/product-sku.entity';
import {
  OrderStatus,
  OrderCloseReason,
} from '../../../common/enums/order-status.enum';
import {
  OrderListQueryDto,
  OrderDetailQueryDto,
  OrderShipDto,
  OrderCloseDto,
  OrderModifyAddressDto,
  OrderListResponseDto,
  OrderDetailResponseDto,
  OrderShipResponseDto,
  OrderCloseResponseDto,
  OrderModifyAddressResponseDto,
  OrderStatusDictionaryItemDto,
} from '../dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(PaymentInfo)
    private readonly paymentInfoRepository: Repository<PaymentInfo>,
    @InjectRepository(ShippingInfo)
    private readonly shippingInfoRepository: Repository<ShippingInfo>,
    @InjectRepository(OrderOperationLog)
    private readonly operationLogRepository: Repository<OrderOperationLog>,
    @InjectRepository(ProductSKU)
    private readonly productSkuRepository: Repository<ProductSKU>,
  ) {}

  /**
   * 获取订单列表
   */
  async getOrderList(query: OrderListQueryDto): Promise<OrderListResponseDto> {
    const {
      order_number,
      receiver_info,
      status,
      start_time,
      end_time,
      page = 1,
      pageSize = 10,
    } = query;

    const queryBuilder: SelectQueryBuilder<Order> = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.spu', 'spu')
      .leftJoinAndSelect('items.sku', 'sku');

    // 订单编号精确搜索
    if (order_number) {
      queryBuilder.andWhere('order.orderNumber = :orderNumber', {
        orderNumber: order_number,
      });
    }

    // 收货人信息模糊搜索
    if (receiver_info) {
      queryBuilder.andWhere(
        '(order.receiverName LIKE :receiverInfo OR order.receiverPhone LIKE :receiverInfo)',
        { receiverInfo: `%${receiver_info}%` },
      );
    }

    // 订单状态筛选
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    // 时间范围筛选
    if (start_time) {
      queryBuilder.andWhere('order.createdAt >= :startTime', {
        startTime: new Date(start_time),
      });
    }
    if (end_time) {
      queryBuilder.andWhere('order.createdAt <= :endTime', {
        endTime: new Date(end_time),
      });
    }

    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // 排序
    queryBuilder.orderBy('order.createdAt', 'DESC');

    const [orders, total] = await queryBuilder.getManyAndCount();

    // 格式化返回数据
    const items = orders.map((order) => ({
      id: order.id,
      order_number: order.orderNumber,
      customer_name: order.receiverName,
      customer_phone: order.receiverPhone,
      total_amount: Number(order.totalAmount),
      status: order.status,
      created_at: order.createdAt.toISOString(),
      product_info: order.items.map((item) => ({
        product_image: item.productImage || '',
        product_name: item.productName,
        sku_spec: item.skuSpec,
        quantity: item.quantity,
      })),
    }));

    return {
      list: items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取订单详情
   */
  async getOrderDetail(
    query: OrderDetailQueryDto,
  ): Promise<OrderDetailResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id: query.id },
      relations: [
        'items',
        'items.spu',
        'items.sku',
        'payments',
        'shippings',
        'operationLogs',
        'operationLogs.operator',
      ],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 格式化返回数据
    const result: OrderDetailResponseDto = {
      id: order.id,
      order_number: order.orderNumber,
      status: order.status,
      created_at: order.createdAt.toISOString(),
      paid_at: order.paidAt ? order.paidAt.toISOString() : null,
      shipped_at: order.shippedAt ? order.shippedAt.toISOString() : null,
      customer_info: {
        name: order.receiverName,
        phone: order.receiverPhone,
        address: order.receiverAddress,
      },
      items: order.items.map((item) => ({
        product_image: item.productImage || '',
        product_name: item.productName,
        sku_spec: item.skuSpec,
        price: Number(item.price),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
      })),
      payment_info: order.payments[0]
        ? {
            method: this.getPaymentMethodLabel(order.payments[0].method),
            transaction_id: order.payments[0].transactionId || '',
            status: this.getPaymentStatusLabel(order.payments[0].status),
          }
        : {
            method: '',
            transaction_id: '',
            status: '',
          },
      shipping_info: order.shippings[0]
        ? {
            company: order.shippings[0].company,
            tracking_number: order.shippings[0].trackingNumber,
            tracking_details: order.shippings[0].trackingDetails || [],
          }
        : {
            company: '',
            tracking_number: '',
            tracking_details: [],
          },
      remark: order.remark || '',
      operation_log: order.operationLogs.map((log) => ({
        operator: log.operatorName,
        action: log.description,
        time: log.createdAt.toISOString(),
      })),
    };

    return result;
  }

  /**
   * 订单发货
   */
  async shipOrder(
    dto: OrderShipDto,
    operatorName: string = '系统',
  ): Promise<OrderShipResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id: dto.id },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== OrderStatus.TO_BE_SHIPPED) {
      throw new BadRequestException('只有待发货状态的订单才能执行发货操作');
    }

    // 开启事务
    return await this.orderRepository.manager.transaction(async (manager) => {
      // 更新订单状态
      const now = new Date();
      await manager.update(Order, dto.id, {
        status: OrderStatus.SHIPPED,
        shippedAt: now,
      });

      // 创建物流信息
      const shippingInfo = manager.create(ShippingInfo, {
        orderId: dto.id,
        company: dto.shipping_company,
        trackingNumber: dto.tracking_number,
        shippedAt: now,
      });
      await manager.save(ShippingInfo, shippingInfo);

      // 记录操作日志
      const operationLog = manager.create(OrderOperationLog, {
        orderId: dto.id,
        operatorName,
        action: '订单发货',
        description: `将订单标记为已发货，物流公司：${dto.shipping_company}，物流单号：${dto.tracking_number}`,
        beforeStatus: OrderStatus.TO_BE_SHIPPED,
        afterStatus: OrderStatus.SHIPPED,
      });
      await manager.save(OrderOperationLog, operationLog);

      return {
        id: order.id,
        order_number: order.orderNumber,
        status: OrderStatus.SHIPPED,
        shipped_at: now.toISOString(),
      };
    });
  }

  /**
   * 关闭订单
   */
  async closeOrder(
    dto: OrderCloseDto,
    operatorName: string = '系统',
  ): Promise<OrderCloseResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id: dto.id },
      relations: ['items', 'items.sku'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('只有待付款状态的订单才能执行关闭操作');
    }

    // 开启事务
    return await this.orderRepository.manager.transaction(async (manager) => {
      const now = new Date();

      // 更新订单状态
      await manager.update(Order, dto.id, {
        status: OrderStatus.CLOSED,
        closeReason: dto.close_reason,
        closeRemark: dto.close_remark,
        closedAt: now,
      });

      // 释放库存
      for (const item of order.items) {
        await manager.increment(
          ProductSKU,
          { id: item.skuId },
          'stock',
          item.quantity,
        );
      }

      // 记录操作日志
      const operationLog = manager.create(OrderOperationLog, {
        orderId: dto.id,
        operatorName,
        action: '订单关闭',
        description: `关闭订单，原因：${this.getCloseReasonLabel(dto.close_reason)}${
          dto.close_remark ? `，备注：${dto.close_remark}` : ''
        }`,
        beforeStatus: OrderStatus.PENDING_PAYMENT,
        afterStatus: OrderStatus.CLOSED,
      });
      await manager.save(OrderOperationLog, operationLog);

      return {
        id: order.id,
        order_number: order.orderNumber,
        status: OrderStatus.CLOSED,
        close_reason: dto.close_reason,
        close_remark: dto.close_remark || '',
      };
    });
  }

  /**
   * 修改订单地址
   */
  async modifyOrderAddress(
    dto: OrderModifyAddressDto,
    operatorName: string = '系统',
  ): Promise<OrderModifyAddressResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id: dto.id },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== OrderStatus.TO_BE_SHIPPED) {
      throw new BadRequestException('只有待发货状态的订单才能修改收货地址');
    }

    // 开启事务
    return await this.orderRepository.manager.transaction(async (manager) => {
      // 更新订单地址信息
      await manager.update(Order, dto.id, {
        receiverName: dto.name,
        receiverPhone: dto.phone,
        receiverAddress: dto.address,
      });

      // 记录操作日志
      const operationLog = manager.create(OrderOperationLog, {
        orderId: dto.id,
        operatorName,
        action: '修改收货地址',
        description: `修改收货地址为：${dto.name} ${dto.phone} ${dto.address}`,
      });
      await manager.save(OrderOperationLog, operationLog);

      return {
        id: order.id,
        order_number: order.orderNumber,
        customer_info: {
          name: dto.name,
          phone: dto.phone,
          address: dto.address,
        },
      };
    });
  }

  /**
   * 获取订单状态字典
   */
  getOrderStatusDictionary(): OrderStatusDictionaryItemDto[] {
    return [
      {
        value: OrderStatus.PENDING_PAYMENT,
        label: '待付款',
        description: '用户已提交订单，但尚未完成支付',
      },
      {
        value: OrderStatus.TO_BE_SHIPPED,
        label: '待发货',
        description: '用户已完成支付，等待商家打包发货',
      },
      {
        value: OrderStatus.SHIPPED,
        label: '已发货',
        description: '商家已将商品交付物流，正在配送中',
      },
      {
        value: OrderStatus.COMPLETED,
        label: '已完成',
        description: '用户已确认收货，或系统超时自动确认',
      },
      {
        value: OrderStatus.CLOSED,
        label: '已关闭',
        description: '订单因超时未支付、用户取消或全额退款而关闭',
      },
      {
        value: OrderStatus.AFTER_SALES,
        label: '售后处理中',
        description: '用户申请退/换货，等待商家处理',
      },
    ];
  }

  /**
   * 获取支付方式标签
   */
  private getPaymentMethodLabel(method: string): string {
    const methodMap: Record<string, string> = {
      WECHAT_PAY: '微信支付',
      ALIPAY: '支付宝',
      BANK_CARD: '银行卡支付',
      BALANCE: '余额支付',
    };
    return methodMap[method] || method;
  }

  /**
   * 获取支付状态标签
   */
  private getPaymentStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: '待支付',
      PAID: '已支付',
      FAILED: '支付失败',
      REFUNDED: '已退款',
    };
    return statusMap[status] || status;
  }

  /**
   * 获取关闭原因标签
   */
  private getCloseReasonLabel(reason: OrderCloseReason): string {
    const reasonMap: Record<string, string> = {
      [OrderCloseReason.TIMEOUT_UNPAID]: '超时未支付',
      [OrderCloseReason.USER_CANCELLED]: '用户主动取消',
      [OrderCloseReason.FRAUD_SUSPECTED]: '疑似欺诈',
      [OrderCloseReason.OUT_OF_STOCK]: '库存不足',
      [OrderCloseReason.OTHER_REASON]: '其他原因',
    };
    return reasonMap[reason] || reason;
  }
}
