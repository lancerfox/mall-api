import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../controllers/order.controller';
import { OrderService } from '../services/order.service';
import { OrderStatus, OrderCloseReason } from '../../../common/enums/order-status.enum';
import { ERROR_CODES, ERROR_MESSAGES } from '../../../common/constants/error-codes';
import {
  OrderListQueryDto,
  OrderDetailQueryDto,
  OrderShipDto,
  OrderCloseDto,
  OrderModifyAddressDto,
} from '../dto';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: jest.Mocked<OrderService>;

  const mockOrderListResponse = {
    list: [
      {
        id: '1',
        order_number: 'ORD202509290001',
        customer_name: '张三',
        customer_phone: '13800138000',
        total_amount: 100,
        status: OrderStatus.TO_BE_SHIPPED,
        created_at: '2025-09-29T10:00:00.000Z',
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
  };

  const mockOrderDetailResponse = {
    id: '1',
    order_number: 'ORD202509290001',
    status: OrderStatus.TO_BE_SHIPPED,
    created_at: '2025-09-29T10:00:00.000Z',
    paid_at: '2025-09-29T10:30:00.000Z',
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
  };

  const mockUser = {
    id: 'user1',
    sub: 'user1',
    username: '管理员',
    role: 'admin',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            getOrderList: jest.fn(),
            getOrderDetail: jest.fn(),
            shipOrder: jest.fn(),
            closeOrder: jest.fn(),
            modifyOrderAddress: jest.fn(),
            getOrderStatusDictionary: jest.fn().mockResolvedValue({ data: [] }),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('应该被正确定义', () => {
    expect(controller).toBeDefined();
  });

  describe('getOrderList', () => {
    it('应该成功返回分页的订单列表', async () => {
      const query: OrderListQueryDto = {
        page: 1,
        pageSize: 10,
      };

      orderService.getOrderList.mockResolvedValue(mockOrderListResponse);

      const result = await controller.getOrderList(query);

      expect(result).toEqual({
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: mockOrderListResponse,
      });

      expect(orderService.getOrderList).toHaveBeenCalledWith(query);
    });

    it('应该处理服务错误', async () => {
      const query: OrderListQueryDto = {
        page: 1,
        pageSize: 10,
      };

      const error = new Error('Database connection failed');
      orderService.getOrderList.mockRejectedValue(error);

      const result = await controller.getOrderList(query);

      expect(result).toEqual({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'Database connection failed',
        data: null,
      });
    });

    it('应该能按订单号筛选', async () => {
      const query: OrderListQueryDto = {
        order_number: 'ORD202509290001',
        page: 1,
        pageSize: 10,
      };

      orderService.getOrderList.mockResolvedValue(mockOrderListResponse);

      await controller.getOrderList(query);

      expect(orderService.getOrderList).toHaveBeenCalledWith(query);
    });

    it('应该能按收货人信息筛选', async () => {
      const query: OrderListQueryDto = {
        receiver_info: '张三',
        page: 1,
        pageSize: 10,
      };

      orderService.getOrderList.mockResolvedValue(mockOrderListResponse);

      await controller.getOrderList(query);

      expect(orderService.getOrderList).toHaveBeenCalledWith(query);
    });

    it('应该能按订单状态筛选', async () => {
      const query: OrderListQueryDto = {
        status: OrderStatus.TO_BE_SHIPPED,
        page: 1,
        pageSize: 10,
      };

      orderService.getOrderList.mockResolvedValue(mockOrderListResponse);

      await controller.getOrderList(query);

      expect(orderService.getOrderList).toHaveBeenCalledWith(query);
    });

    it('应该能按日期范围筛选', async () => {
      const query: OrderListQueryDto = {
        start_time: '2025-09-29T00:00:00.000Z',
        end_time: '2025-09-29T23:59:59.000Z',
        page: 1,
        pageSize: 10,
      };

      orderService.getOrderList.mockResolvedValue(mockOrderListResponse);

      await controller.getOrderList(query);

      expect(orderService.getOrderList).toHaveBeenCalledWith(query);
    });
  });

  describe('getOrderDetail', () => {
    it('应该成功返回订单详情', async () => {
      const query: OrderDetailQueryDto = { id: '1' };

      orderService.getOrderDetail.mockResolvedValue(mockOrderDetailResponse);

      const result = await controller.getOrderDetail(query);

      expect(result).toEqual({
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: mockOrderDetailResponse,
      });

      expect(orderService.getOrderDetail).toHaveBeenCalledWith(query);
    });

    it('应该处理订单不存在的错误', async () => {
      const query: OrderDetailQueryDto = { id: '999' };

      const error = new Error('订单不存在');
      (error as any).status = 404;
      orderService.getOrderDetail.mockRejectedValue(error);

      const result = await controller.getOrderDetail(query);

      expect(result).toEqual({
        code: ERROR_CODES.ORDER_NOT_FOUND,
        message: '订单不存在',
        data: null,
      });
    });

    it('应该处理一般服务错误', async () => {
      const query: OrderDetailQueryDto = { id: '1' };

      const error = new Error('Database error');
      orderService.getOrderDetail.mockRejectedValue(error);

      const result = await controller.getOrderDetail(query);

      expect(result).toEqual({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'Database error',
        data: null,
      });
    });
  });

  describe('shipOrder', () => {
    it('应该成功发货订单', async () => {
      const dto: OrderShipDto = {
        id: '1',
        shipping_company: '顺丰快递',
        tracking_number: 'SF123456789',
      };

      const mockShipResponse = {
        id: '1',
        order_number: 'ORD202509290001',
        status: OrderStatus.SHIPPED,
        shipped_at: '2025-09-29T15:00:00.000Z',
      };

      orderService.shipOrder.mockResolvedValue(mockShipResponse);

      const result = await controller.shipOrder(dto, mockUser);

      expect(result).toEqual({
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: mockShipResponse,
      });

      expect(orderService.shipOrder).toHaveBeenCalledWith(dto, '管理员');
    });

    it('应该处理订单不存在的错误', async () => {
      const dto: OrderShipDto = {
        id: '999',
        shipping_company: '顺丰快递',
        tracking_number: 'SF123456789',
      };

      const error = new Error('订单不存在');
      (error as any).status = 404;
      orderService.shipOrder.mockRejectedValue(error);

      const result = await controller.shipOrder(dto, mockUser);

      expect(result).toEqual({
        code: ERROR_CODES.ORDER_NOT_FOUND,
        message: '订单不存在',
        data: null,
      });
    });

    it('应该处理无效状态错误', async () => {
      const dto: OrderShipDto = {
        id: '1',
        shipping_company: '顺丰快递',
        tracking_number: 'SF123456789',
      };

      const error = new Error('只有待发货状态的订单才能执行发货操作');
      orderService.shipOrder.mockRejectedValue(error);

      const result = await controller.shipOrder(dto, mockUser);

      expect(result).toEqual({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: '只有待发货状态的订单才能执行发货操作',
        data: null,
      });
    });

    it('当用户未提供时应该使用默认操作员名称', async () => {
      const dto: OrderShipDto = {
        id: '1',
        shipping_company: '顺丰快递',
        tracking_number: 'SF123456789',
      };

      const mockShipResponse = {
        id: '1',
        order_number: 'ORD202509290001',
        status: OrderStatus.SHIPPED,
        shipped_at: '2025-09-29T15:00:00.000Z',
      };

      orderService.shipOrder.mockResolvedValue(mockShipResponse);

      await controller.shipOrder(dto, null as any);

      expect(orderService.shipOrder).toHaveBeenCalledWith(dto, '系统');
    });
  });

  describe('closeOrder', () => {
    it('应该成功关闭订单', async () => {
      const dto: OrderCloseDto = {
        id: '1',
        close_reason: OrderCloseReason.TIMEOUT_UNPAID,
        close_remark: '超时未支付自动关闭',
      };

      const mockCloseResponse = {
        id: '1',
        order_number: 'ORD202509290001',
        status: OrderStatus.CLOSED,
        close_reason: OrderCloseReason.TIMEOUT_UNPAID,
        close_remark: '超时未支付自动关闭',
      };

      orderService.closeOrder.mockResolvedValue(mockCloseResponse);

      const result = await controller.closeOrder(dto, mockUser);

      expect(result).toEqual({
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: mockCloseResponse,
      });

      expect(orderService.closeOrder).toHaveBeenCalledWith(dto, '管理员');
    });

    it('应该处理订单不存在的错误', async () => {
      const dto: OrderCloseDto = {
        id: '999',
        close_reason: OrderCloseReason.TIMEOUT_UNPAID,
      };

      const error = new Error('订单不存在');
      (error as any).status = 404;
      orderService.closeOrder.mockRejectedValue(error);

      const result = await controller.closeOrder(dto, mockUser);

      expect(result).toEqual({
        code: ERROR_CODES.ORDER_NOT_FOUND,
        message: '订单不存在',
        data: null,
      });
    });

    it('应该处理无效状态错误', async () => {
      const dto: OrderCloseDto = {
        id: '1',
        close_reason: OrderCloseReason.TIMEOUT_UNPAID,
      };

      const error = new Error('只有待付款状态的订单才能执行关闭操作');
      orderService.closeOrder.mockRejectedValue(error);

      const result = await controller.closeOrder(dto, mockUser);

      expect(result).toEqual({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: '只有待付款状态的订单才能执行关闭操作',
        data: null,
      });
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

      const mockModifyResponse = {
        id: '1',
        order_number: 'ORD202509290001',
        customer_info: {
          name: '李四',
          phone: '13900139000',
          address: '上海市浦东新区新地址',
        },
      };

      orderService.modifyOrderAddress.mockResolvedValue(mockModifyResponse);

      const result = await controller.modifyOrderAddress(dto, mockUser);

      expect(result).toEqual({
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: mockModifyResponse,
      });

      expect(orderService.modifyOrderAddress).toHaveBeenCalledWith(dto, '管理员');
    });

    it('应该处理订单不存在的错误', async () => {
      const dto: OrderModifyAddressDto = {
        id: '999',
        name: '李四',
        phone: '13900139000',
        address: '上海市浦东新区新地址',
      };

      const error = new Error('订单不存在');
      (error as any).status = 404;
      orderService.modifyOrderAddress.mockRejectedValue(error);

      const result = await controller.modifyOrderAddress(dto, mockUser);

      expect(result).toEqual({
        code: ERROR_CODES.ORDER_NOT_FOUND,
        message: '订单不存在',
        data: null,
      });
    });

    it('应该处理无效状态错误', async () => {
      const dto: OrderModifyAddressDto = {
        id: '1',
        name: '李四',
        phone: '13900139000',
        address: '上海市浦东新区新地址',
      };

      const error = new Error('只有待发货状态的订单才能修改收货地址');
      orderService.modifyOrderAddress.mockRejectedValue(error);

      const result = await controller.modifyOrderAddress(dto, mockUser);

      expect(result).toEqual({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: '只有待发货状态的订单才能修改收货地址',
        data: null,
      });
    });
  });

  describe('getOrderStatusDictionary', () => {
    it('应该成功返回订单状态字典', async () => {
      const mockDictionaryResponse = {
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
      };

      (orderService.getOrderStatusDictionary as jest.Mock).mockResolvedValue(mockDictionaryResponse);

      const result = await controller.getOrderStatusDictionary();

      expect(result).toEqual({
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: mockDictionaryResponse.data,
      });

      expect(orderService.getOrderStatusDictionary).toHaveBeenCalled();
    });

    it('应该处理服务错误', async () => {
      const mockError = new Error('Service unavailable');
      (orderService.getOrderStatusDictionary as jest.Mock).mockRejectedValue(mockError);

      const result = await controller.getOrderStatusDictionary();

      expect(result).toEqual({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'Service unavailable',
        data: null,
      });
    });
  });
});