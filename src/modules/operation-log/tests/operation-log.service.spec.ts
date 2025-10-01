import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OperationLogService } from '../services/operation-log.service';
import { OperationLog } from '../entities/operation-log.entity';
import { Repository } from 'typeorm';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { CreateOperationLogDto } from '../dto/create-operation-log.dto';
import { OperationLogListDto } from '../dto/operation-log-list.dto';

describe('OperationLogService', () => {
  let service: OperationLogService;
  let repository: Repository<OperationLog>;

  // Mock data
  const mockOperationLog = {
    id: '1',
    userId: 'user1',
    username: 'testuser',
    module: 'auth',
    operationType: 'login',
    description: 'User login',
    method: 'POST',
    url: '/auth/login',
    ip: '127.0.0.1',
    userAgent: 'test-agent',
    createdAt: new Date(),
  } as OperationLog;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperationLogService,
        {
          provide: getRepositoryToken(OperationLog),
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
          },
        },
      ],
    }).compile();

    service = module.get<OperationLogService>(OperationLogService);
    repository = module.get<Repository<OperationLog>>(
      getRepositoryToken(OperationLog),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an operation log successfully', async () => {
      const createDto: CreateOperationLogDto = {
        userId: 'user1',
        username: 'testuser',
        module: 'auth',
        operationType: 'login',
        description: 'User login',
        method: 'POST',
        url: '/auth/login',
        ip: '127.0.0.1',
      };

      (repository.create as jest.Mock).mockReturnValue(createDto);
      (repository.save as jest.Mock).mockResolvedValue(mockOperationLog);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockOperationLog);
    });

    it('should throw an error if creation fails', async () => {
      const createDto: CreateOperationLogDto = {
        userId: 'user1',
        username: 'testuser',
        module: 'auth',
        operationType: 'login',
        description: 'User login',
        method: 'POST',
        url: '/auth/login',
        ip: '127.0.0.1',
      };

      (repository.create as jest.Mock).mockReturnValue(createDto);
      (repository.save as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.create(createDto)).rejects.toThrow('Database error');
    });
  });

  describe('getList', () => {
    it('should return operation logs with pagination', async () => {
      const listDto: OperationLogListDto = {
        page: 1,
        pageSize: 10,
        module: 'auth',
        operationType: 'login',
        username: 'test',
        startTime: '2023-01-01',
        endTime: '2023-12-31',
      };

      const mockList = [mockOperationLog];
      const mockTotal = 1;

      (repository.findAndCount as jest.Mock).mockResolvedValue([
        mockList,
        mockTotal,
      ]);

      const result = await service.getList(listDto);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          module: expect.anything(), // Like('%auth%')
          operationType: 'login',
          username: expect.anything(), // Like('%test%')
          createdAt: expect.anything(), // Between dates
        },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({ list: mockList, total: mockTotal });
    });

    it('should handle query without filters', async () => {
      const listDto: OperationLogListDto = {
        page: 1,
        pageSize: 10,
      };

      const mockList = [mockOperationLog];
      const mockTotal = 1;

      (repository.findAndCount as jest.Mock).mockResolvedValue([
        mockList,
        mockTotal,
      ]);

      const result = await service.getList(listDto);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({ list: mockList, total: mockTotal });
    });

    it('should handle startTime without endTime', async () => {
      const listDto: OperationLogListDto = {
        page: 1,
        pageSize: 10,
        startTime: '2023-01-01',
      };

      const mockList = [mockOperationLog];
      const mockTotal = 1;

      (repository.findAndCount as jest.Mock).mockResolvedValue([
        mockList,
        mockTotal,
      ]);

      const result = await service.getList(listDto);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          createdAt: expect.anything(), // Between startTime and now
        },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should handle endTime without startTime', async () => {
      const listDto: OperationLogListDto = {
        page: 1,
        pageSize: 10,
        endTime: '2023-12-31',
      };

      const mockList = [mockOperationLog];
      const mockTotal = 1;

      (repository.findAndCount as jest.Mock).mockResolvedValue([
        mockList,
        mockTotal,
      ]);

      const result = await service.getList(listDto);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          createdAt: expect.anything(), // Between epoch and endTime
        },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('getById', () => {
    it('should return operation log by ID', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockOperationLog);

      const result = await service.getById('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockOperationLog);
    });

    it('should throw OPERATION_LOG_NOT_FOUND error if log does not exist', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.getById('nonexistent')).rejects.toThrow(
        new BusinessException(ERROR_CODES.OPERATION_LOG_NOT_FOUND),
      );
    });
  });
});
