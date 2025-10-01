import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../controllers/order.controller';
import { OrderService } from '../services/order.service';
import { OrderListQueryDto } from '../dto/order-list-query.dto';
import { OrderDetailQueryDto } from '../dto/order-detail-query.dto';
import { OrderShipDto } from '../dto/order-ship.dto';
import { OrderCloseDto } from '../dto/order-close.dto';
import { OrderModifyAddressDto } from '../dto/order-modify-address.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

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
            getOrderStatusDictionary: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOrderList', () => {
    it('should call orderService.getOrderList', async () => {
      const query: OrderListQueryDto = { page: 1, pageSize: 10 };
      const mockResult = {
        list: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };
      (service.getOrderList as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getOrderList(query);

      expect(service.getOrderList).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getOrderDetail', () => {
    it('should call orderService.getOrderDetail', async () => {
      const query: OrderDetailQueryDto = { id: '1' };
      const mockResult = { id: '1', order_number: 'ORDER123456' };
      (service.getOrderDetail as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getOrderDetail(query);

      expect(service.getOrderDetail).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('shipOrder', () => {
    it('should call orderService.shipOrder with operator name', async () => {
      const dto: OrderShipDto = {
        id: '1',
        shipping_company: 'SF Express',
        tracking_number: 'SF123456789',
      };
      const mockUser = { username: 'testuser' };
      const mockResult = {
        id: '1',
        order_number: 'ORDER123456',
        status: 'SHIPPED',
      };
      (service.shipOrder as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.shipOrder(dto, mockUser);

      expect(service.shipOrder).toHaveBeenCalledWith(dto, 'testuser');
      expect(result).toEqual(mockResult);
    });

    it('should use system as operator name if user is undefined', async () => {
      const dto: OrderShipDto = {
        id: '1',
        shipping_company: 'SF Express',
        tracking_number: 'SF123456789',
      };
      const mockResult = {
        id: '1',
        order_number: 'ORDER123456',
        status: 'SHIPPED',
      };
      (service.shipOrder as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.shipOrder(dto, undefined);

      expect(service.shipOrder).toHaveBeenCalledWith(dto, '系统');
      expect(result).toEqual(mockResult);
    });
  });

  describe('closeOrder', () => {
    it('should call orderService.closeOrder with operator name', async () => {
      const dto: OrderCloseDto = {
        id: '1',
        close_reason: 'USER_CANCELLED',
      };
      const mockUser = { username: 'testuser' };
      const mockResult = {
        id: '1',
        order_number: 'ORDER123456',
        status: 'CLOSED',
      };
      (service.closeOrder as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.closeOrder(dto, mockUser);

      expect(service.closeOrder).toHaveBeenCalledWith(dto, 'testuser');
      expect(result).toEqual(mockResult);
    });
  });

  describe('modifyOrderAddress', () => {
    it('should call orderService.modifyOrderAddress with operator name', async () => {
      const dto: OrderModifyAddressDto = {
        id: '1',
        name: 'New Name',
        phone: '13900139000',
        address: 'New Address',
      };
      const mockUser = { username: 'testuser' };
      const mockResult = { id: '1', order_number: 'ORDER123456' };
      (service.modifyOrderAddress as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.modifyOrderAddress(dto, mockUser);

      expect(service.modifyOrderAddress).toHaveBeenCalledWith(dto, 'testuser');
      expect(result).toEqual(mockResult);
    });
  });

  describe('getOrderStatusDictionary', () => {
    it('should call orderService.getOrderStatusDictionary', () => {
      const mockResult = [{ value: 'PENDING_PAYMENT', label: '待付款' }];
      (service.getOrderStatusDictionary as jest.Mock).mockReturnValue(
        mockResult,
      );

      const result = controller.getOrderStatusDictionary();

      expect(service.getOrderStatusDictionary).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });
});
