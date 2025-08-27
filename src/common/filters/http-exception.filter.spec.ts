import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { ERROR_CODES } from '../constants/error-codes';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      method: 'GET',
      url: '/api/test',
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle HttpException', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Test error',
        data: null,
        timestamp: expect.any(String),
      });
    });

    it('should handle BadRequestException with validation errors', () => {
      const validationErrors = [
        {
          property: 'username',
          constraints: {
            isNotEmpty: 'username should not be empty',
            minLength: 'username must be longer than or equal to 3 characters',
          },
        },
      ];

      const exception = new BadRequestException({
        message: validationErrors,
      });

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: '数据验证失败',
        data: null,
        timestamp: expect.any(String),
        errors: {
          username: ['username should not be empty', 'username must be longer than or equal to 3 characters'],
        },
      });
    });

    it('should handle unauthorized exception', () => {
      const exception = new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Unauthorized',
        data: null,
        timestamp: expect.any(String),
      });
    });

    it('should handle forbidden exception', () => {
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: ERROR_CODES.FORBIDDEN,
        message: 'Forbidden',
        data: null,
        timestamp: expect.any(String),
      });
    });

    it('should handle not found exception', () => {
      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'Not Found',
        data: null,
        timestamp: expect.any(String),
      });
    });

    it('should handle internal server error', () => {
      const exception = new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
        data: null,
        timestamp: expect.any(String),
      });
    });
  });
});