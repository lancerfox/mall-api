import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { OperationLogService } from './operation-log.service';
import { OperationLog, OperationLogDocument } from '../entities/operation-log.entity';
import { CreateOperationLogDto } from '../dto/create-operation-log.dto';
import { OperationLogQueryDto } from '../dto/operation-log-response.dto';

describe('OperationLogService', () => {
  let service: OperationLogService;
  let operationLogModel: jest.Mocked<Model<OperationLogDocument>>;

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
    save: jest.fn().mockResolvedValue(this),
  };

  const mockLogDocument = {
    ...mockOperationLog,
    save: jest.fn().mockResolvedValue(mockOperationLog),
  };

  beforeEach(async () => {
    const mockOperationLogModel = jest.fn().mockImplementation(() => mockLogDocument);
    mockOperationLogModel.find = jest.fn();
    mockOperationLogModel.findById = jest.fn();
    mockOperationLogModel.countDocuments = jest.fn();
    mockOperationLogModel.deleteMany = jest.fn();
    mockOperationLogModel.aggregate = jest.fn();
    mockOperationLogModel.create = jest.fn();
    mockOperationLogModel.save = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperationLogService,
        {
          provide: getModelToken(OperationLog.name),
          useValue: mockOperationLogModel,
        },
      ],
    }).compile();

    service = module.get<OperationLogService>(OperationLogService);
    operationLogModel = module.get(getModelToken(OperationLog.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create operation log', async () => {
      const createOperationLogDto: CreateOperationLogDto = {
        userId: '507f1f77bcf86cd799439012',
        username: 'testuser',
        action: 'login',
        module: 'auth',
        description: '用户登录成功',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        status: 'success',
        method: 'POST',
        url: '/api/auth/login',
      };

      const result = await service.create(createOperationLogDto);

      expect(operationLogModel).toHaveBeenCalledWith(createOperationLogDto);
      expect(mockLogDocument.save).toHaveBeenCalled();
      expect(result).toEqual(mockOperationLog);
    });
  });

  describe('logLogin', () => {
    it('should log successful login', async () => {
      const result = await service.logLogin(
        '507f1f77bcf86cd799439012',
        'testuser',
        '127.0.0.1',
        'test-agent',
        'success',
      );

      expect(operationLogModel).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '507f1f77bcf86cd799439012',
          username: 'testuser',
          action: 'login',
          module: 'auth',
          description: '用户登录成功',
          ip: '127.0.0.1',
          userAgent: 'test-agent',
          status: 'success',
          method: 'POST',
          url: '/api/auth/login',
        }),
      );
      expect(result).toEqual(mockOperationLog);
    });

    it('should log failed login', async () => {
      const result = await service.logLogin(
        '507f1f77bcf86cd799439012',
        'testuser',
        '127.0.0.1',
        'test-agent',
        'error',
        '用户名或密码错误',
      );

      expect(operationLogModel).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'login',
          description: '用户登录失败',
          status: 'error',
          errorMessage: '用户名或密码错误',
        }),
      );
      expect(result).toEqual(mockOperationLog);
    });
  });

  describe('logLogout', () => {
    it('should log logout', async () => {
      const result = await service.logLogout(
        '507f1f77bcf86cd799439012',
        'testuser',
        '127.0.0.1',
        'test-agent',
      );

      expect(operationLogModel).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '507f1f77bcf86cd799439012',
          username: 'testuser',
          action: 'logout',
          module: 'auth',
          description: '用户退出登录',
          ip: '127.0.0.1',
          userAgent: 'test-agent',
          status: 'success',
          method: 'POST',
          url: '/api/auth/logout',
        }),
      );
      expect(result).toEqual(mockOperationLog);
    });
  });

  describe('logPasswordChange', () => {
    it('should log successful password change', async () => {
      const result = await service.logPasswordChange(
        '507f1f77bcf86cd799439012',
        'testuser',
        '127.0.0.1',
        'test-agent',
        'success',
      );

      expect(operationLogModel).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'change_password',
          description: '用户修改密码成功',
          status: 'success',
        }),
      );
      expect(result).toEqual(mockOperationLog);
    });

    it('should log failed password change', async () => {
      const result = await service.logPasswordChange(
        '507f1f77bcf86cd799439012',
        'testuser',
        '127.0.0.1',
        'test-agent',
        'error',
        '当前密码不正确',
      );

      expect(operationLogModel).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'change_password',
          description: '用户修改密码失败',
          status: 'error',
          errorMessage: '当前密码不正确',
        }),
      );
      expect(result).toEqual(mockOperationLog);
    });
  });

  describe('logProfileUpdate', () => {
    it('should log successful profile update', async () => {
      const result = await service.logProfileUpdate(
        '507f1f77bcf86cd799439012',
        'testuser',
        '127.0.0.1',
        'test-agent',
        'success',
      );

      expect(operationLogModel).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update_profile',
          description: '用户更新资料成功',
          status: 'success',
        }),
      );
      expect(result).toEqual(mockOperationLog);
    });
  });

  describe('findAll', () => {
    it('should return paginated operation logs', async () => {
      const query: OperationLogQueryDto = { page: 1, limit: 10 };
      const mockLogs = [mockOperationLog];
      const mockSort = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLogs),
          }),
        }),
      });
      operationLogModel.find.mockReturnValue({ sort: mockSort } as any);
      operationLogModel.countDocuments.mockReturnValue(1 as any);

      const result = await service.findAll(query);

      expect(result).toEqual({
        data: mockLogs,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should apply filters', async () => {
      const query: OperationLogQueryDto = {
        page: 1,
        limit: 10,
        username: 'testuser',
        module: 'auth',
        action: 'login',
        status: 'success',
        ip: '127.0.0.1',
        startTime: '2023-01-01',
        endTime: '2023-12-31',
      };
      const mockSort = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });
      operationLogModel.find.mockReturnValue({ sort: mockSort } as any);
      operationLogModel.countDocuments.mockReturnValue(0 as any);

      await service.findAll(query);

      expect(operationLogModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          username: { $regex: 'testuser', $options: 'i' },
          module: 'auth',
          action: 'login',
          status: 'success',
          ip: { $regex: '127.0.0.1', $options: 'i' },
          createdAt: {
            $gte: new Date('2023-01-01'),
            $lte: new Date('2023-12-31'),
          },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return operation log by id', async () => {
      operationLogModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockOperationLog) } as any);

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(operationLogModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockOperationLog);
    });

    it('should throw NotFoundException when log not found', async () => {
      operationLogModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);

      await expect(service.findById('507f1f77bcf86cd799439011')).rejects.toThrow(
        new NotFoundException('操作日志不存在'),
      );
    });
  });

  describe('findByUserId', () => {
    it('should return user operation logs', async () => {
      const query: OperationLogQueryDto = { page: 1, limit: 10 };
      const mockLogs = [mockOperationLog];
      const mockSort = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockLogs),
          }),
        }),
      });
      operationLogModel.find.mockReturnValue({ sort: mockSort } as any);
      operationLogModel.countDocuments.mockReturnValue(1 as any);

      const result = await service.findByUserId('507f1f77bcf86cd799439012', query);

      expect(operationLogModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '507f1f77bcf86cd799439012',
        }),
      );
      expect(result).toEqual({
        data: mockLogs,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('getStatistics', () => {
    it('should return log statistics', async () => {
      const mockStats = [
        { _id: 'auth', count: 50 },
        { _id: 'user', count: 30 },
      ];
      operationLogModel.countDocuments.mockReturnValueOnce(100 as any);
      operationLogModel.countDocuments.mockReturnValueOnce(95 as any);
      operationLogModel.countDocuments.mockReturnValueOnce(5 as any);
      operationLogModel.aggregate
        .mockReturnValueOnce(mockStats as any)
        .mockReturnValueOnce(mockStats as any)
        .mockReturnValueOnce(mockStats as any);

      const result = await service.getStatistics('2023-01-01', '2023-12-31');

      expect(result).toEqual({
        total: 100,
        success: 95,
        error: 5,
        successRate: '95.00',
        moduleStats: [
          { module: 'auth', count: 50 },
          { module: 'user', count: 30 },
        ],
        actionStats: [
          { action: 'auth', count: 50 },
          { action: 'user', count: 30 },
        ],
        userStats: [
          { username: 'auth', count: 50 },
          { username: 'user', count: 30 },
        ],
      });
    });

    it('should handle empty statistics', async () => {
      operationLogModel.countDocuments.mockReturnValue(0 as any);
      operationLogModel.aggregate.mockReturnValue([] as any);

      const result = await service.getStatistics();

      expect(result.successRate).toBe('0.00');
    });
  });

  describe('cleanupOldLogs', () => {
    it('should cleanup old logs', async () => {
      operationLogModel.deleteMany.mockReturnValue({ deletedCount: 50 } as any);

      const result = await service.cleanupOldLogs(30);

      expect(operationLogModel.deleteMany).toHaveBeenCalledWith({
        createdAt: { $lt: expect.any(Date) },
      });
      expect(result).toEqual({
        deletedCount: 50,
        cutoffDate: expect.any(Date),
      });
    });
  });
});