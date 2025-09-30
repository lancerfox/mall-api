import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderService } from '../services/order.service';
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
} from '../dto';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: Repository<Order>;
  let orderItemRepository: Repository<OrderItem>;
  let paymentInfoRepository: Repository<PaymentInfo>;
  let shippingInfoRepository: Repository<ShippingInfo>;
  let operationLogRepository: Repository<OrderOperationLog>;
  let productSkuRepository: Repository<ProductSKU>;

  const mockOrder = {
    id: '1',
    orderNumber: 'ORD202509290001',
    status: OrderStatus.TO_BE_SHIPPED,
    totalAmount: '100.00',
    receiverName: '张三',
    receiverPhone: '13800138000',
    receiverAddress: '北京市朝阳区测试地址',
    createdAt: new Date(),
    paidAt: new Date(),
    shippedAt: null,
    items: [
      {
        id: '1',
        productName: '测试商品',
        skuSpec: '红色/L',
        quantity: 2,
        price: '50.00',
        subtotal: '100.00',
        productImage: 'test.jpg',
      },
    ],
    payments: [
      {
        method: 'WECHAT_PAY',
        status: 'PAID',
        transactionId: 'wx123456789',
      },
    ],
    shippings: [],
    operationLogs: [],
  };

  const mockQueryBuilder = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockOrder], 1]),
  };

  const mockRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    increment: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    manager: {
      transaction: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(PaymentInfo),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ShippingInfo),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(OrderOperationLog),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ProductSKU),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    orderItemRepository = module.get<Repository<OrderItem>>(
      getRepositoryToken(OrderItem),
    );
    paymentInfoRepository = module.get<Repository<PaymentInfo>>(
      getRepositoryToken(PaymentInfo),
    );
    shippingInfoRepository = module.get<Repository<ShippingInfo>>(
      getRepositoryToken(ShippingInfo),
    );
    operationLogRepository = module.get<Repository<OrderOperationLog>>(
      getRepositoryToken(OrderOperationLog),
    );
    productSkuRepository = module.get<Repository<ProductSKU>>(
      getRepositoryToken(ProductSKU),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('应该被正确定义', () => {
    expect(service).toBeDefined();
  });

  describe('getOrderList', () => {
    it('应该返回分页的订单列表', async () => {
      const query: OrderListQueryDto = {
        page: 1,
        pageSize: 10,
      };

      const result = await service.getOrderList(query);

      expect(result).toEqual({
        data: [
          {
            id: '1',
            order_number: 'ORD202509290001',
            customer_name: '张三',
            customer_phone: '13800138000',
            total_amount: 100,
            status: OrderStatus.TO_BE_SHIPPED,
            created_at: mockOrder.createdAt.toISOString(),
            product_info: [
              {
                product_image: 'test.jpg',
                product_name: '测试商品',
                sku_spec: '红色/L',
                quantity: 2,
              },
            ],
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      expect(orderRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('应该能按订单号筛选', async () => {
      const query: OrderListQueryDto = {
        order_number: 'ORD202509290001',
        page: 1,
        pageSize: 10,
      };

      await service.getOrderList(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.orderNumber = :orderNumber',
        { orderNumber: 'ORD202509290001' },
      );
    });

    it('应该能按收货人信息筛选', async () => {
      const query: OrderListQueryDto = {
        receiver_info: '张三',
        page: 1,
        pageSize: 10,
      };

      await service.getOrderList(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(order.receiverName LIKE :receiverInfo OR order.receiverPhone LIKE :receiverInfo)',
        { receiverInfo: '%张三%' },
      );
    });

    it('应该能按订单状态筛选', async () => {
      const query: OrderListQueryDto = {
        status: OrderStatus.TO_BE_SHIPPED,
        page: 1,
        pageSize: 10,
      };

      await service.getOrderList(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.status = :status',
        { status: OrderStatus.TO_BE_SHIPPED },
      );
    });
  });

  describe('getOrderDetail', () => {
    it('应该返回订单详情', async () => {
      const query: OrderDetailQueryDto = { id: '1' };
      mockRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.getOrderDetail(query);

      expect(result).toEqual({
        id: '1',
        order_number: 'ORD202509290001',
        status: OrderStatus.TO_BE_SHIPPED,
        created_at: mockOrder.createdAt.toISOString(),
        paid_at: mockOrder.paidAt.toISOString(),
        shipped_at: null,
        customer_info: {
          name: '张三',
          phone: '13800138000',
          address: '北京市朝阳区测试地址',
        },
        items: [
          {
            product_image: 'test.jpg',
            product_name: '测试商品',
            sku_spec: '红色/L',
            price: 50,
            quantity: 2,
            subtotal: 100,
          },
        ],
        payment_info: {
          method: '微信支付',
          transaction_id: 'wx123456789',
          status: '已支付',
        },
        shipping_info: {
          company: '',
          tracking_number: '',
          tracking_details: [],
        },
        remark: '',
        operation_log: [],
      });

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
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
    });

    it('当订单不存在时应该抛出NotFoundException', async () => {
      const query: OrderDetailQueryDto = { id: '999' };
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getOrderDetail(query)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getOrderDetail(query)).rejects.toThrow('订单不存在');
    });
  });

  describe('shipOrder', () => {
    it('应该成功发货订单', async () => {
      const dto: OrderShipDto = {
        id: '1',
        shipping_company: '顺丰快递',
        tracking_number: 'SF123456789',
      };

      const mockTransactionManager = {
        update: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      mockRepository.findOne.mockResolvedValue(mockOrder);
      mockRepository.manager.transaction.mockImplementation(
        async (callback) => {
          return callback(mockTransactionManager);
        },
      );

      const result = await service.shipOrder(dto, '管理员');

      expect(result).toEqual({
        id: '1',
        order_number: 'ORD202509290001',
        status: OrderStatus.SHIPPED,
        shipped_at: expect.any(String),
      });

      expect(mockRepository.manager.transaction).toHaveBeenCalled();
    });

    it('当订单不存在时应该抛出NotFoundException', async () => {
      const dto: OrderShipDto = {
        id: '999',
        shipping_company: '顺丰快递',
        tracking_number: 'SF123456789',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.shipOrder(dto, '管理员')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.shipOrder(dto, '管理员')).rejects.toThrow(
        '订单不存在',
      );
    });

    it('当订单状态不是待发货时应该抛出BadRequestException', async () => {
      const dto: OrderShipDto = {
        id: '1',
        shipping_company: '顺丰快递',
        tracking_number: 'SF123456789',
      };

      const orderWithWrongStatus = {
        ...mockOrder,
        status: OrderStatus.PENDING_PAYMENT,
      };
      mockRepository.findOne.mockResolvedValue(orderWithWrongStatus);

      await expect(service.shipOrder(dto, '管理员')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.shipOrder(dto, '管理员')).rejects.toThrow(
        '只有待发货状态的订单才能执行发货操作',
      );
    });
  });

  describe('closeOrder', () => {
    it('应该成功关闭订单', async () => {
      const dto: OrderCloseDto = {
        id: '1',
        close_reason: OrderCloseReason.TIMEOUT_UNPAID,
        close_remark: '超时未支付自动关闭',
      };

      const orderWithPendingPayment = {
        ...mockOrder,
        status: OrderStatus.PENDING_PAYMENT,
        items: [
          {
            skuId: 'sku1',
            quantity: 2,
          },
        ],
      };

      const mockTransactionManager = {
        update: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        increment: jest.fn(),
      };

      mockRepository.findOne.mockResolvedValue(orderWithPendingPayment);
      mockRepository.manager.transaction.mockImplementation(
        async (callback) => {
          return callback(mockTransactionManager);
        },
      );

      const result = await service.closeOrder(dto, '管理员');

      expect(result).toEqual({
        id: '1',
        order_number: 'ORD202509290001',
        status: OrderStatus.CLOSED,
        close_reason: OrderCloseReason.TIMEOUT_UNPAID,
        close_remark: '超时未支付自动关闭',
      });

      expect(mockRepository.manager.transaction).toHaveBeenCalled();
    });

    it('当订单不存在时应该抛出NotFoundException', async () => {
      const dto: OrderCloseDto = {
        id: '999',
        close_reason: OrderCloseReason.TIMEOUT_UNPAID,
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.closeOrder(dto, '管理员')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.closeOrder(dto, '管理员')).rejects.toThrow(
        '订单不存在',
      );
    });

    it('当订单状态不是待付款时应该抛出BadRequestException', async () => {
      const dto: OrderCloseDto = {
        id: '1',
        close_reason: OrderCloseReason.TIMEOUT_UNPAID,
      };

      const orderWithWrongStatus = {
        ...mockOrder,
        status: OrderStatus.SHIPPED,
      };
      mockRepository.findOne.mockResolvedValue(orderWithWrongStatus);

      await expect(service.closeOrder(dto, '管理员')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.closeOrder(dto, '管理员')).rejects.toThrow(
        '只有待付款状态的订单才能执行关闭操作',
      );
    });
  });

  describe('modifyOrderAddress', () => {
    it('应该成功修改订单地址', async () => {
      const dto: OrderModifyAddressDto = {
        id: '1',
        name: '李四',
        phone: '13900139000',
        address: '上海市浦东新区新地址',
      };

      const mockTransactionManager = {
        update: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      mockRepository.findOne.mockResolvedValue(mockOrder);
      mockRepository.manager.transaction.mockImplementation(
        async (callback) => {
          return callback(mockTransactionManager);
        },
      );

      const result = await service.modifyOrderAddress(dto, '管理员');

      expect(result).toEqual({
        id: '1',
        order_number: 'ORD202509290001',
        customer_info: {
          name: '李四',
          phone: '13900139000',
          address: '上海市浦东新区新地址',
        },
      });

      expect(mockRepository.manager.transaction).toHaveBeenCalled();
    });

    it('当订单不存在时应该抛出NotFoundException', async () => {
      const dto: OrderModifyAddressDto = {
        id: '999',
        name: '李四',
        phone: '13900139000',
        address: '上海市浦东新区新地址',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.modifyOrderAddress(dto, '管理员')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.modifyOrderAddress(dto, '管理员')).rejects.toThrow(
        '订单不存在',
      );
    });

    it('当订单状态不是待发货时应该抛出BadRequestException', async () => {
      const dto: OrderModifyAddressDto = {
        id: '1',
        name: '李四',
        phone: '13900139000',
        address: '上海市浦东新区新地址',
      };

      const orderWithWrongStatus = {
        ...mockOrder,
        status: OrderStatus.SHIPPED,
      };
      mockRepository.findOne.mockResolvedValue(orderWithWrongStatus);

      await expect(service.modifyOrderAddress(dto, '管理员')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.modifyOrderAddress(dto, '管理员')).rejects.toThrow(
        '只有待发货状态的订单才能修改收货地址',
      );
    });
  });

  describe('getOrderStatusDictionary', () => {
    it('应该返回订单状态字典', async () => {
      const result = await service.getOrderStatusDictionary();

      expect(result).toEqual({
        data: [
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
        ],
      });
    });
  });
});
