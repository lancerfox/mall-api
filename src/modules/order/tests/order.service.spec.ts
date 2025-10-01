import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderService } from '../services/order.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { PaymentInfo } from '../entities/payment-info.entity';
import { ShippingInfo } from '../entities/shipping-info.entity';
import { OrderOperationLog } from '../entities/order-operation-log.entity';
import { ProductSKU } from '../../product/entities/product-sku.entity';
import { Repository } from 'typeorm';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import {
  OrderStatus,
  OrderCloseReason,
} from '../../../common/enums/order-status.enum';
import { OrderListQueryDto } from '../dto/order-list-query.dto';
import { OrderDetailQueryDto } from '../dto/order-detail-query.dto';
import { OrderShipDto } from '../dto/order-ship.dto';
import { OrderCloseDto } from '../dto/order-close.dto';
import { OrderModifyAddressDto } from '../dto/order-modify-address.dto';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: Repository<Order>;
  let orderItemRepository: Repository<OrderItem>;

  // Mock data
  const mockOrder = {
    id: '1',
    orderNumber: 'ORDER123456',
    receiverName: 'Test User',
    receiverPhone: '13800138000',
    receiverAddress: 'Test Address',
    totalAmount: 100,
    status: OrderStatus.PENDING_PAYMENT,
    createdAt: new Date(),
    items: [],
    payments: [],
    shippings: [],
    operationLogs: [],
  } as Order;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            findBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
            preload: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
            manager: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            findBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
            preload: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PaymentInfo),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            findBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
            preload: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ShippingInfo),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            findBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
            preload: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrderOperationLog),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            findBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
            preload: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductSKU),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            findBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
            preload: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    orderItemRepository = module.get<Repository<OrderItem>>(
      getRepositoryToken(OrderItem),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrderList', () => {
    it('should return order list with pagination', async () => {
      const query: OrderListQueryDto = {
        page: 1,
        pageSize: 10,
      };

      const mockOrders = [mockOrder];
      const mockTotal = 1;

      const queryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOrders, mockTotal]),
      };

      (orderRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilder,
      );

      const result = await service.getOrderList(query);

      expect(orderRepository.createQueryBuilder).toHaveBeenCalledWith('order');
      expect(result).toEqual({
        list: expect.any(Array),
        total: mockTotal,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
    });
  });

  describe('getOrderDetail', () => {
    it('should return order detail', async () => {
      const query: OrderDetailQueryDto = { id: '1' };
      const mockOrderWithRelations = {
        ...mockOrder,
        items: [],
        payments: [],
        shippings: [],
        operationLogs: [],
      };

      (orderRepository.findOne as jest.Mock).mockResolvedValue(
        mockOrderWithRelations,
      );

      const result = await service.getOrderDetail(query);

      expect(orderRepository.findOne).toHaveBeenCalledWith({
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
      expect(result).toBeDefined();
    });

    it('should throw ORDER_NOT_FOUND error if order does not exist', async () => {
      const query: OrderDetailQueryDto = { id: 'nonexistent' };

      (orderRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.getOrderDetail(query)).rejects.toThrow(
        new BusinessException(ERROR_CODES.ORDER_NOT_FOUND),
      );
    });
  });

  describe('shipOrder', () => {
    it('should ship an order successfully', async () => {
      const dto: OrderShipDto = {
        id: '1',
        shipping_company: 'SF Express',
        tracking_number: 'SF123456789',
      };

      const mockUpdatedOrder = {
        ...mockOrder,
        status: OrderStatus.TO_BE_SHIPPED,
      };

      (orderRepository.findOne as jest.Mock).mockResolvedValue(
        mockUpdatedOrder,
      );
      (orderRepository.manager.transaction as jest.Mock).mockImplementation(
        async (callback) => {
          return await callback({
            update: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          });
        },
      );

      const result = await service.shipOrder(dto);

      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(orderRepository.manager.transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ORDER_NOT_FOUND error if order does not exist', async () => {
      const dto: OrderShipDto = {
        id: 'nonexistent',
        shipping_company: 'SF Express',
        tracking_number: 'SF123456789',
      };

      (orderRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.shipOrder(dto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.ORDER_NOT_FOUND),
      );
    });

    it('should throw ORDER_CANNOT_SHIP error if order status is not TO_BE_SHIPPED', async () => {
      const dto: OrderShipDto = {
        id: '1',
        shipping_company: 'SF Express',
        tracking_number: 'SF123456789',
      };

      const mockOrderWrongStatus = {
        ...mockOrder,
        status: OrderStatus.PENDING_PAYMENT,
      };

      (orderRepository.findOne as jest.Mock).mockResolvedValue(
        mockOrderWrongStatus,
      );

      await expect(service.shipOrder(dto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.ORDER_CANNOT_SHIP),
      );
    });
  });

  describe('closeOrder', () => {
    it('should close an order successfully', async () => {
      const dto: OrderCloseDto = {
        id: '1',
        close_reason: OrderCloseReason.USER_CANCELLED,
        close_remark: 'User cancelled order',
      };

      const mockOrderToClose = {
        ...mockOrder,
        status: OrderStatus.PENDING_PAYMENT,
        items: [],
      };

      (orderRepository.findOne as jest.Mock).mockResolvedValue(
        mockOrderToClose,
      );
      (orderRepository.manager.transaction as jest.Mock).mockImplementation(
        async (callback) => {
          return await callback({
            update: jest.fn(),
            increment: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          });
        },
      );

      const result = await service.closeOrder(dto);

      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['items', 'items.sku'],
      });
      expect(orderRepository.manager.transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ORDER_NOT_FOUND error if order does not exist', async () => {
      const dto: OrderCloseDto = {
        id: 'nonexistent',
        close_reason: OrderCloseReason.USER_CANCELLED,
      };

      (orderRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.closeOrder(dto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.ORDER_NOT_FOUND),
      );
    });

    it('should throw ORDER_CANNOT_CLOSE error if order status is not PENDING_PAYMENT', async () => {
      const dto: OrderCloseDto = {
        id: '1',
        close_reason: OrderCloseReason.USER_CANCELLED,
      };

      const mockOrderWrongStatus = {
        ...mockOrder,
        status: OrderStatus.SHIPPED,
      };

      (orderRepository.findOne as jest.Mock).mockResolvedValue(
        mockOrderWrongStatus,
      );

      await expect(service.closeOrder(dto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.ORDER_CANNOT_CLOSE),
      );
    });
  });

  describe('modifyOrderAddress', () => {
    it('should modify order address successfully', async () => {
      const dto: OrderModifyAddressDto = {
        id: '1',
        name: 'New Name',
        phone: '13900139000',
        address: 'New Address',
      };

      const mockOrderToModify = {
        ...mockOrder,
        status: OrderStatus.TO_BE_SHIPPED,
      };

      (orderRepository.findOne as jest.Mock).mockResolvedValue(
        mockOrderToModify,
      );
      (orderRepository.manager.transaction as jest.Mock).mockImplementation(
        async (callback) => {
          return await callback({
            update: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          });
        },
      );

      const result = await service.modifyOrderAddress(dto);

      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(orderRepository.manager.transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ORDER_NOT_FOUND error if order does not exist', async () => {
      const dto: OrderModifyAddressDto = {
        id: 'nonexistent',
        name: 'New Name',
        phone: '13900139000',
        address: 'New Address',
      };

      (orderRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.modifyOrderAddress(dto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.ORDER_NOT_FOUND),
      );
    });

    it('should throw ORDER_CANNOT_MODIFY_ADDRESS error if order status is not TO_BE_SHIPPED', async () => {
      const dto: OrderModifyAddressDto = {
        id: '1',
        name: 'New Name',
        phone: '13900139000',
        address: 'New Address',
      };

      const mockOrderWrongStatus = {
        ...mockOrder,
        status: OrderStatus.SHIPPED,
      };

      (orderRepository.findOne as jest.Mock).mockResolvedValue(
        mockOrderWrongStatus,
      );

      await expect(service.modifyOrderAddress(dto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.ORDER_CANNOT_MODIFY_ADDRESS),
      );
    });
  });

  describe('getOrderStatusDictionary', () => {
    it('should return order status dictionary', () => {
      const result = service.getOrderStatusDictionary();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('value');
      expect(result[0]).toHaveProperty('label');
      expect(result[0]).toHaveProperty('description');
    });
  });

  describe('getPaymentMethodLabel', () => {
    it('should return correct label for payment method', () => {
      expect((service as any).getPaymentMethodLabel('WECHAT_PAY')).toBe(
        '微信支付',
      );
      expect((service as any).getPaymentMethodLabel('ALIPAY')).toBe('支付宝');
      expect((service as any).getPaymentMethodLabel('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('getPaymentStatusLabel', () => {
    it('should return correct label for payment status', () => {
      expect((service as any).getPaymentStatusLabel('PENDING')).toBe('待支付');
      expect((service as any).getPaymentStatusLabel('PAID')).toBe('已支付');
      expect((service as any).getPaymentStatusLabel('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('getCloseReasonLabel', () => {
    it('should return correct label for close reason', () => {
      expect(
        (service as any).getCloseReasonLabel(OrderCloseReason.USER_CANCELLED),
      ).toBe('用户主动取消');
      expect(
        (service as any).getCloseReasonLabel(OrderCloseReason.TIMEOUT_UNPAID),
      ).toBe('超时未支付');
      expect(
        (service as any).getCloseReasonLabel('UNKNOWN' as OrderCloseReason),
      ).toBe('UNKNOWN');
    });
  });
});
