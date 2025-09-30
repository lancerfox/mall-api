import { ApiProperty } from '@nestjs/swagger';
import { IApiResponse } from '../../../common/types/api-response.interface';
import { OperationType } from '../entities/operation-log.entity';

export class OperationLogData {
  @ApiProperty({
    description: '日志ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '操作用户ID',
    example: '1234567890',
  })
  userId: string;

  @ApiProperty({
    description: '操作用户名',
    example: 'admin',
  })
  username: string;

  @ApiProperty({
    description: '操作模块',
    example: '用户管理',
  })
  module: string;

  @ApiProperty({
    description: '操作类型',
    enum: OperationType,
    example: OperationType.CREATE,
  })
  operationType: OperationType;

  @ApiProperty({
    description: '操作描述',
    example: '创建新用户',
  })
  description: string;

  @ApiProperty({
    description: '请求方法',
    example: 'POST',
  })
  method: string;

  @ApiProperty({
    description: '请求URL',
    example: '/api/users/create',
  })
  url: string;

  @ApiProperty({
    description: 'IP地址',
    example: '192.168.1.1',
  })
  ip: string;

  @ApiProperty({
    description: '用户代理',
    example:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    required: false,
  })
  userAgent?: string;

  @ApiProperty({
    description: '创建时间',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}

export class OperationLogResponseDto implements IApiResponse<OperationLogData> {
  @ApiProperty({
    description: '响应状态码',
    example: 200,
  })
  code: number;

  @ApiProperty({
    description: '响应消息',
    example: '操作成功',
  })
  message: string;

  @ApiProperty({
    description: '响应数据',
    type: OperationLogData,
  })
  data: OperationLogData;
}

export class OperationLogListResponseDto
  implements IApiResponse<{ list: OperationLogData[]; total: number }>
{
  @ApiProperty({
    description: '响应状态码',
    example: 200,
  })
  code: number;

  @ApiProperty({
    description: '响应消息',
    example: '操作成功',
  })
  message: string;

  @ApiProperty({
    description: '响应数据',
    type: 'object',
    properties: {
      list: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/OperationLogData',
        },
      },
      total: {
        type: 'number',
        example: 100,
      },
    },
  })
  data: {
    list: OperationLogData[];
    total: number;
  };
}
