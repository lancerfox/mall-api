import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { OperationLogController } from '../controllers/operation-log.controller';
import { OperationLogService } from '../services/operation-log.service';
import { OperationLogQueryDto } from '../dto/operation-log-response.dto';
import { UserService } from '../../user/services/user.service';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

describe('OperationLogController', () => {
  let controller: OperationLogController;
  let operationLogService: jest.Mocked<OperationLogService>;

  const mockOperationLog = {
    _id: '507f1f77bcf86cd799439011',
    userId: '507f1f77bcf86cd799439012',
    username: 'testuser',
    action: 'login',
    module: 'auth',
    description: '用户登录成功',
    ip: '127.0.0.1',
    userAgent: 'test-agent',
    status: 'success',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLogList = {
    data: [mockOperationLog],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const mockStatistics = {
    total: 100,
    success: 95,
    error: 5,
    successRate: '95.00',
    moduleStats: [
      { module: 'auth', count: 50 },
      { module: 'user', count: 30 },
    ],
    actionStats: [
      { action: 'login', count: 40 },
      { action: 'create', count: 20 },
    ],
    userStats: [
      { username: 'admin', count: 60 },
      { username: 'user1', count: 40 },
    ],
  };

  beforeEach(async () => {
    const mockOperationLogService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      getStatistics: jest.fn(),
    };

    const mockUserService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperationLogController],
      providers: [
        { provide: OperationLogService, useValue: mockOperationLogService },
        { provide: UserService, useValue: mockUserService },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<OperationLogController>(OperationLogController);
    operationLogService = module.get(OperationLogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOperationLogs', () => {
    it('should return operation logs list', async () => {
      const query: OperationLogQueryDto = {
        page: 1,
        limit: 10,
        username: 'testuser',
        module: 'auth',
        action: 'login',
        status: 'success',
      };
      operationLogService.findAll.mockResolvedValue(mockLogList);

      const result = await controller.getOperationLogs(query);

      expect(operationLogService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockLogList);
    });

    it('should handle empty query parameters', async () => {
      const query: OperationLogQueryDto = {};
      operationLogService.findAll.mockResolvedValue(mockLogList);

      const result = await controller.getOperationLogs(query);

      expect(operationLogService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockLogList);
    });
  });

  describe('getOperationLogById', () => {
    it('should return operation log by id', async () => {
      operationLogService.findById.mockResolvedValue(mockOperationLog as any);

      const result = await controller.getOperationLogById(
        '507f1f77bcf86cd799439011',
      );

      expect(operationLogService.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockOperationLog);
    });
  });

  describe('getUserOperationLogs', () => {
    it('should return user operation logs', async () => {
      const query: OperationLogQueryDto = { page: 1, limit: 10 };
      operationLogService.findByUserId.mockResolvedValue(mockLogList);

      const result = await controller.getUserOperationLogs(
        '507f1f77bcf86cd799439012',
        query,
      );

      expect(operationLogService.findByUserId).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
        query,
      );
      expect(result).toEqual(mockLogList);
    });

    it('should handle empty query for user logs', async () => {
      const query: OperationLogQueryDto = {};
      operationLogService.findByUserId.mockResolvedValue(mockLogList);

      const result = await controller.getUserOperationLogs(
        '507f1f77bcf86cd799439012',
        query,
      );

      expect(operationLogService.findByUserId).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
        query,
      );
      expect(result).toEqual(mockLogList);
    });
  });

  describe('getLogStatistics', () => {
    it('should return log statistics', async () => {
      const query = { startTime: '2023-01-01', endTime: '2023-12-31' };
      operationLogService.getStatistics.mockResolvedValue(mockStatistics);

      const result = await controller.getLogStatistics(query);

      expect(operationLogService.getStatistics).toHaveBeenCalledWith(
        '2023-01-01',
        '2023-12-31',
      );
      expect(result).toEqual(mockStatistics);
    });

    it('should handle empty time range', async () => {
      const query = {};
      operationLogService.getStatistics.mockResolvedValue(mockStatistics);

      const result = await controller.getLogStatistics(query);

      expect(operationLogService.getStatistics).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(result).toEqual(mockStatistics);
    });

    it('should handle partial time range', async () => {
      const query = { startTime: '2023-01-01' };
      operationLogService.getStatistics.mockResolvedValue(mockStatistics);

      const result = await controller.getLogStatistics(query);

      expect(operationLogService.getStatistics).toHaveBeenCalledWith(
        '2023-01-01',
        undefined,
      );
      expect(result).toEqual(mockStatistics);
    });
  });
});
