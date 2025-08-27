import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  OperationLog,
  OperationLogDocument,
  OperationLogSchema,
} from '../entities/operation-log.entity';

describe('OperationLog Entity', () => {
  let operationLogModel: Model<OperationLogDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(OperationLog.name),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn().mockResolvedValue({}),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    operationLogModel = module.get<Model<OperationLogDocument>>(
      getModelToken(OperationLog.name),
    );
  });

  it('should be defined', () => {
    expect(operationLogModel).toBeDefined();
  });

  describe('OperationLog Schema', () => {
    it('should have required fields', () => {
      const operationLogSchema = OperationLogSchema;
      const paths = operationLogSchema.paths;

      expect(paths.userId).toBeDefined();
      expect(paths.username).toBeDefined();
      expect(paths.action).toBeDefined();
      expect(paths.module).toBeDefined();
      expect(paths.status).toBeDefined();
    });

    it('should have correct default values', () => {
      const operationLogSchema = OperationLogSchema;
      const paths = operationLogSchema.paths;

      expect(paths.status.defaultValue).toBe('success');
    });

    it('should have correct enum values for status', () => {
      const operationLogSchema = OperationLogSchema;
      const statusPath = operationLogSchema.paths.status;

      expect(statusPath.enumValues).toContain('success');
      expect(statusPath.enumValues).toContain('error');
    });

    it('should have timestamps enabled', () => {
      const operationLogSchema = OperationLogSchema;
      expect(operationLogSchema.options.timestamps).toBe(true);
    });

    it('should have proper indexes', () => {
      const operationLogSchema = OperationLogSchema;
      const indexes = operationLogSchema.indexes();

      // Check if indexes exist
      expect(indexes.length).toBeGreaterThan(0);

      // Find specific indexes
      const userIdCreatedAtIndex = indexes.find(
        (index) => index[0].userId === 1 && index[0].createdAt === -1,
      );
      const moduleCreatedAtIndex = indexes.find(
        (index) => index[0].module === 1 && index[0].createdAt === -1,
      );
      const actionCreatedAtIndex = indexes.find(
        (index) => index[0].action === 1 && index[0].createdAt === -1,
      );
      const statusCreatedAtIndex = indexes.find(
        (index) => index[0].status === 1 && index[0].createdAt === -1,
      );
      const createdAtIndex = indexes.find(
        (index) =>
          index[0].createdAt === -1 && Object.keys(index[0]).length === 1,
      );
      const ipIndex = indexes.find(
        (index) => index[0].ip === 1 && Object.keys(index[0]).length === 1,
      );
      const usernameCreatedAtIndex = indexes.find(
        (index) => index[0].username === 1 && index[0].createdAt === -1,
      );

      expect(userIdCreatedAtIndex).toBeDefined();
      expect(moduleCreatedAtIndex).toBeDefined();
      expect(actionCreatedAtIndex).toBeDefined();
      expect(statusCreatedAtIndex).toBeDefined();
      expect(createdAtIndex).toBeDefined();
      expect(ipIndex).toBeDefined();
      expect(usernameCreatedAtIndex).toBeDefined();
    });
  });

  describe('OperationLog Entity Validation', () => {
    it('should create a valid operation log instance', () => {
      const logData = {
        userId: '507f1f77bcf86cd799439011',
        username: 'admin',
        action: 'create',
        module: 'user',
        description: '创建用户',
        ip: '192.168.1.1',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        requestData: { username: 'newuser', email: 'newuser@example.com' },
        responseData: { id: '507f1f77bcf86cd799439012', success: true },
        status: 'success',
        executionTime: 150,
        method: 'POST',
        url: '/api/users',
      };

      const operationLog = new OperationLog();
      Object.assign(operationLog, logData);

      expect(operationLog.userId).toBe('507f1f77bcf86cd799439011');
      expect(operationLog.username).toBe('admin');
      expect(operationLog.action).toBe('create');
      expect(operationLog.module).toBe('user');
      expect(operationLog.description).toBe('创建用户');
      expect(operationLog.ip).toBe('192.168.1.1');
      expect(operationLog.userAgent).toBe(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      );
      expect(operationLog.requestData).toEqual({
        username: 'newuser',
        email: 'newuser@example.com',
      });
      expect(operationLog.responseData).toEqual({
        id: '507f1f77bcf86cd799439012',
        success: true,
      });
      expect(operationLog.status).toBe('success');
      expect(operationLog.executionTime).toBe(150);
      expect(operationLog.method).toBe('POST');
      expect(operationLog.url).toBe('/api/users');
    });

    it('should handle optional fields', () => {
      const logData = {
        userId: '507f1f77bcf86cd799439011',
        username: 'admin',
        action: 'list',
        module: 'user',
        status: 'success',
      };

      const operationLog = new OperationLog();
      Object.assign(operationLog, logData);

      expect(operationLog.description).toBeUndefined();
      expect(operationLog.ip).toBeUndefined();
      expect(operationLog.userAgent).toBeUndefined();
      expect(operationLog.requestData).toBeUndefined();
      expect(operationLog.responseData).toBeUndefined();
      expect(operationLog.errorMessage).toBeUndefined();
      expect(operationLog.executionTime).toBeUndefined();
      expect(operationLog.method).toBeUndefined();
      expect(operationLog.url).toBeUndefined();
    });

    it('should handle error status log', () => {
      const logData = {
        userId: '507f1f77bcf86cd799439011',
        username: 'admin',
        action: 'create',
        module: 'user',
        description: '创建用户失败',
        ip: '192.168.1.1',
        requestData: {
          username: 'existinguser',
          email: 'existing@example.com',
        },
        status: 'error',
        errorMessage: '用户名已存在',
        executionTime: 50,
        method: 'POST',
        url: '/api/users',
      };

      const operationLog = new OperationLog();
      Object.assign(operationLog, logData);

      expect(operationLog.status).toBe('error');
      expect(operationLog.errorMessage).toBe('用户名已存在');
      expect(operationLog.responseData).toBeUndefined();
    });

    it('should handle complex request and response data', () => {
      const complexRequestData = {
        user: {
          username: 'testuser',
          profile: {
            firstName: 'Test',
            lastName: 'User',
            preferences: {
              theme: 'dark',
              language: 'zh-CN',
            },
          },
        },
        metadata: {
          source: 'web',
          timestamp: new Date(),
        },
      };

      const complexResponseData = {
        success: true,
        data: {
          id: '507f1f77bcf86cd799439011',
          createdAt: new Date(),
          permissions: ['user:read', 'user:write'],
        },
        meta: {
          version: '1.0.0',
          requestId: 'req-123456',
        },
      };

      const logData = {
        userId: '507f1f77bcf86cd799439011',
        username: 'admin',
        action: 'create',
        module: 'user',
        requestData: complexRequestData,
        responseData: complexResponseData,
        status: 'success',
      };

      const operationLog = new OperationLog();
      Object.assign(operationLog, logData);

      expect(operationLog.requestData).toEqual(complexRequestData);
      expect(operationLog.responseData).toEqual(complexResponseData);
    });
  });
});
