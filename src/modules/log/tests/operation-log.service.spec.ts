import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OperationLogService } from '../services/operation-log.service';
import {
  OperationLog,
  OperationLogDocument,
} from '../entities/operation-log.entity';
import { CreateOperationLogDto } from '../dto/create-operation-log.dto';

describe('OperationLogService', () => {
  let service: OperationLogService;
  let operationLogModel: Model<OperationLogDocument>;

  const mockOperationLog = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId().toString(),
    username: 'testuser',
    action: 'CREATE',
    module: 'USER',
    description: 'Created new user',
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    requestData: { username: 'newuser' },
    responseData: { success: true },
    status: 'success',
    createdAt: new Date(),
    toObject: () => mockOperationLog,
    save: jest.fn(),
  };

  const mockOperationLogModel = {
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
  };

  beforeEach(async () => {
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
    operationLogModel = module.get<Model<OperationLogDocument>>(
      getModelToken(OperationLog.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create operation log successfully', async () => {
      const createLogDto: CreateOperationLogDto = {
        userId: new Types.ObjectId().toString(),
        username: 'testuser',
        action: 'CREATE',
        module: 'USER',
        description: 'Created new user',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        requestData: { username: 'newuser' },
        responseData: { success: true },
        status: 'success',
      };

      const mockCreatedLog = {
        ...mockOperationLog,
        save: jest.fn().mockResolvedValue(mockOperationLog),
      };
      jest
        .spyOn(operationLogModel, 'constructor' as any)
        .mockReturnValue(mockCreatedLog);

      const result = await service.create(createLogDto);

      expect(result).toBeDefined();
      expect(result.action).toBe(createLogDto.action);
      expect(result.module).toBe(createLogDto.module);
    });
  });

  describe('findAll', () => {
    it('should return paginated operation logs', async () => {
      const query = {
        page: 1,
        limit: 10,
      };

      const mockLogs = [mockOperationLog];
      mockOperationLogModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockLogs),
              }),
            }),
          }),
        }),
      });
      mockOperationLogModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result).toBeDefined();
      expect(result.data).toEqual(mockLogs);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter logs by search criteria', async () => {
      const query = {
        page: 1,
        limit: 10,
        username: 'testuser',
        action: 'CREATE',
        module: 'USER',
        status: 'success',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      mockOperationLogModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([mockOperationLog]),
              }),
            }),
          }),
        }),
      });
      mockOperationLogModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result).toBeDefined();
      expect(mockOperationLogModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          username: { $regex: 'testuser', $options: 'i' },
          action: 'CREATE',
          module: 'USER',
          status: 'success',
          createdAt: expect.objectContaining({
            $gte: expect.any(Date),
            $lte: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('findByUser', () => {
    it('should return user operation logs', async () => {
      const userId = new Types.ObjectId().toString();
      const query = {
        page: 1,
        limit: 10,
      };

      const mockLogs = [mockOperationLog];
      mockOperationLogModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockLogs),
            }),
          }),
        }),
      });
      mockOperationLogModel.countDocuments.mockResolvedValue(1);

      const result = await service.findByUser(userId, query);

      expect(result).toBeDefined();
      expect(result.data).toEqual(mockLogs);
      expect(mockOperationLogModel.find).toHaveBeenCalledWith({ userId });
    });
  });

  describe('getStatistics', () => {
    it('should return operation statistics', async () => {
      const mockStats = [
        { _id: 'CREATE', count: 10 },
        { _id: 'UPDATE', count: 5 },
        { _id: 'DELETE', count: 2 },
      ];

      mockOperationLogModel.aggregate.mockResolvedValue(mockStats);

      const result = await service.getStatistics();

      expect(result).toBeDefined();
      expect(result).toEqual(mockStats);
    });
  });

  describe('cleanup', () => {
    it('should cleanup old logs successfully', async () => {
      const days = 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      mockOperationLogModel.countDocuments.mockResolvedValue(10);
      const mockDeleteResult = { deletedCount: 10 };
      jest
        .spyOn(operationLogModel, 'deleteMany' as any)
        .mockResolvedValue(mockDeleteResult);

      const result = await service.cleanup(days);

      expect(result).toBeDefined();
      expect(result.deletedCount).toBe(10);
    });
  });

  describe('logUserAction', () => {
    it('should log user action successfully', async () => {
      const userId = new Types.ObjectId().toString();
      const username = 'testuser';
      const action = 'LOGIN';
      const module = 'AUTH';
      const description = 'User logged in';
      const ip = '127.0.0.1';
      const userAgent = 'Mozilla/5.0';

      const mockCreatedLog = {
        ...mockOperationLog,
        save: jest.fn().mockResolvedValue(mockOperationLog),
      };
      jest
        .spyOn(operationLogModel, 'constructor' as any)
        .mockReturnValue(mockCreatedLog);

      const result = await service.logUserAction(
        userId,
        username,
        action,
        module,
        description,
        ip,
        userAgent,
      );

      expect(result).toBeDefined();
      expect(result.action).toBe(action);
      expect(result.module).toBe(module);
    });
  });
});
