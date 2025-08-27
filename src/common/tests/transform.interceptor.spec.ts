import { Test, TestingModule } from '@nestjs/testing';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from '../interceptors/transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformInterceptor],
    }).compile();

    interceptor = module.get<TransformInterceptor<any>>(TransformInterceptor);

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
          url: '/api/test',
        }),
        getResponse: jest.fn().mockReturnValue({
          statusCode: 200,
        }),
      }),
    } as any;

    mockCallHandler = {
      handle: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should transform response data', (done) => {
      const testData = { id: 1, name: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result.subscribe((transformedData) => {
        expect(transformedData).toEqual({
          code: 0,
          message: '操作成功',
          data: testData,
          timestamp: expect.any(String),
        });
        done();
      });
    });

    it('should handle null data', (done) => {
      mockCallHandler.handle.mockReturnValue(of(null));

      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result.subscribe((transformedData) => {
        expect(transformedData).toEqual({
          code: 0,
          message: '操作成功',
          data: null,
          timestamp: expect.any(String),
        });
        done();
      });
    });

    it('should handle undefined data', (done) => {
      mockCallHandler.handle.mockReturnValue(of(undefined));

      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result.subscribe((transformedData) => {
        expect(transformedData).toEqual({
          code: 0,
          message: '操作成功',
          data: undefined,
          timestamp: expect.any(String),
        });
        done();
      });
    });

    it('should handle array data', (done) => {
      const testData = [
        { id: 1, name: 'test1' },
        { id: 2, name: 'test2' },
      ];
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result.subscribe((transformedData) => {
        expect(transformedData).toEqual({
          code: 0,
          message: '操作成功',
          data: testData,
          timestamp: expect.any(String),
        });
        done();
      });
    });

    it('should handle string data', (done) => {
      const testData = 'Hello World';
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result.subscribe((transformedData) => {
        expect(transformedData).toEqual({
          code: 0,
          message: '操作成功',
          data: testData,
          timestamp: expect.any(String),
        });
        done();
      });
    });

    it('should handle number data', (done) => {
      const testData = 42;
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result.subscribe((transformedData) => {
        expect(transformedData).toEqual({
          code: 0,
          message: '操作成功',
          data: testData,
          timestamp: expect.any(String),
        });
        done();
      });
    });

    it('should handle boolean data', (done) => {
      const testData = true;
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result.subscribe((transformedData) => {
        expect(transformedData).toEqual({
          code: 0,
          message: '操作成功',
          data: testData,
          timestamp: expect.any(String),
        });
        done();
      });
    });

    it('should always use success code regardless of status code', (done) => {
      const testData = { id: 1, name: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testData));

      // Mock different status code
      mockExecutionContext.switchToHttp().getResponse = jest
        .fn()
        .mockReturnValue({
          statusCode: 201,
        });

      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result.subscribe((transformedData) => {
        expect(transformedData).toEqual({
          code: 0,
          message: '操作成功',
          data: testData,
          timestamp: expect.any(String),
        });
        done();
      });
    });

    it('should generate valid timestamp', (done) => {
      const testData = { id: 1, name: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result.subscribe((transformedData) => {
        const timestamp = new Date(transformedData.timestamp);
        expect(timestamp).toBeInstanceOf(Date);
        expect(timestamp.getTime()).not.toBeNaN();
        done();
      });
    });
  });
});
