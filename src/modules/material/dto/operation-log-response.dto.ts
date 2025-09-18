import { ApiProperty } from '@nestjs/swagger';
import { OperationType } from '../entities/operation-log.entity';

export class OperationLogDto {
  @ApiProperty({
    description: '操作日志ID',
    example: '64b5f8e8f123456789abcdef',
  })
  id: string;

  @ApiProperty({
    description: '操作类型',

    enum: OperationType,
    example: OperationType.CREATE,
  })
  operationType: OperationType;

  @ApiProperty({
    description: '操作者用户ID',
    example: '64b5f8e8f123456789abcdef',
  })
  userId: string;

  @ApiProperty({
    description: '操作者用户名',
    example: 'admin',
  })
  username: string;

  @ApiProperty({
    description: '材料ID',
    example: '64b5f8e8f123456789abcdef',
    required: false,
  })
  materialId?: string;

  @ApiProperty({
    description: '材料名称',
    example: '翡翠原石',
    required: false,
  })
  materialName?: string;

  @ApiProperty({
    description: '操作描述',
    example: '创建了新材料：翡翠原石',
  })
  description: string;

  @ApiProperty({
    description: '操作前数据',
    example: {},
    required: false,
  })
  beforeData?: any;

  @ApiProperty({
    description: '操作后数据',
    example: {},
    required: false,
  })
  afterData?: any;

  @ApiProperty({
    description: 'IP地址',
    example: '192.168.1.1',
    required: false,
  })
  ipAddress?: string;

  @ApiProperty({
    description: '用户代理',
    example: 'Mozilla/5.0...',
    required: false,
  })
  userAgent?: string;

  @ApiProperty({
    description: '操作时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  operationTime: Date;
}

class PaginationDataDto {
  @ApiProperty({
    description: '操作日志列表',
    type: [OperationLogDto],
  })
  items: OperationLogDto[];

  @ApiProperty({
    description: '总数',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: '当前页码',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '每页数量',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: '总页数',
    example: 10,
  })
  totalPages: number;
}

export class OperationLogListResponseDto {
  @ApiProperty({
    description: '业务状态码',
    example: 200,
  })
  code: number;

  @ApiProperty({
    description: '响应消息',
    example: '获取操作日志列表成功',
  })
  message: string;

  @ApiProperty({
    description: '分页数据',
    type: PaginationDataDto,
  })
  data: PaginationDataDto;
}

export class OperationStatsDto {
  @ApiProperty({
    description: '操作类型',

    enum: OperationType,
    example: OperationType.CREATE,
  })
  operationType: OperationType;

  @ApiProperty({
    description: '操作次数',
    example: 15,
  })
  count: number;

  @ApiProperty({
    description: '最近操作时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastOperationTime: Date;
}

class StatsDataDto {
  @ApiProperty({
    description: '总操作次数',
    example: 150,
  })
  totalOperations: number;

  @ApiProperty({
    description: '今日操作次数',
    example: 5,
  })
  todayOperations: number;

  @ApiProperty({
    description: '本周操作次数',
    example: 25,
  })
  weekOperations: number;

  @ApiProperty({
    description: '本月操作次数',
    example: 80,
  })
  monthOperations: number;

  @ApiProperty({
    description: '操作类型统计',
    type: [OperationStatsDto],
  })
  operationTypeStats: OperationStatsDto[];

  @ApiProperty({
    description: '最近7天每日操作统计',
    example: {
      '2024-01-01': 10,
      '2024-01-02': 8,
      '2024-01-03': 12,
    },
  })
  dailyStats: Record<string, number>;
}

export class OperationLogStatsResponseDto {
  @ApiProperty({
    description: '业务状态码',
    example: 200,
  })
  code: number;

  @ApiProperty({
    description: '响应消息',
    example: '获取操作统计成功',
  })
  message: string;

  @ApiProperty({
    description: '统计数据',
    type: StatsDataDto,
  })
  data: StatsDataDto;
}
