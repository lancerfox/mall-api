import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 操作日志响应数据传输对象
 */
export class OperationLogResponseDto {
  @ApiProperty({
    description: '日志ID',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: '用户ID',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;

  @ApiProperty({
    description: '用户名',
    example: 'admin',
  })
  username: string;

  @ApiProperty({
    description: '操作动作',
    example: 'create',
  })
  action: string;

  @ApiProperty({
    description: '操作模块',
    example: 'user',
  })
  module: string;

  @ApiPropertyOptional({
    description: '操作描述',
    example: '创建用户',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'IP地址',
    example: '192.168.1.1',
  })
  ip?: string;

  @ApiPropertyOptional({
    description: '用户代理',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  userAgent?: string;

  @ApiPropertyOptional({
    description: '请求数据',
    example: { username: 'newuser', email: 'newuser@example.com' },
  })
  requestData?: any;

  @ApiPropertyOptional({
    description: '响应数据',
    example: { id: '507f1f77bcf86cd799439011', success: true },
  })
  responseData?: any;

  @ApiProperty({
    description: '操作状态',
    example: 'success',
    enum: ['success', 'error'],
  })
  status: string;

  @ApiPropertyOptional({
    description: '错误信息',
    example: '用户名已存在',
  })
  errorMessage?: string;

  @ApiPropertyOptional({
    description: '执行时间（毫秒）',
    example: 150,
  })
  executionTime?: number;

  @ApiPropertyOptional({
    description: 'HTTP方法',
    example: 'POST',
  })
  method?: string;

  @ApiPropertyOptional({
    description: '请求URL',
    example: '/api/users',
  })
  url?: string;

  @ApiProperty({
    description: '创建时间',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '更新时间',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

/**
 * 操作日志查询参数
 */
export class OperationLogQueryDto {
  @ApiPropertyOptional({
    description: '页码',
    example: 1,
  })
  page?: number;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
  })
  limit?: number;

  @ApiPropertyOptional({
    description: '用户名',
    example: 'admin',
  })
  username?: string;

  @ApiPropertyOptional({
    description: '操作模块',
    example: 'user',
  })
  module?: string;

  @ApiPropertyOptional({
    description: '操作动作',
    example: 'create',
  })
  action?: string;

  @ApiPropertyOptional({
    description: '操作状态',
    example: 'success',
    enum: ['success', 'error'],
  })
  status?: string;

  @ApiPropertyOptional({
    description: '开始时间',
    example: '2023-01-01T00:00:00.000Z',
  })
  startTime?: string;

  @ApiPropertyOptional({
    description: '结束时间',
    example: '2023-01-31T23:59:59.999Z',
  })
  endTime?: string;

  @ApiPropertyOptional({
    description: 'IP地址',
    example: '192.168.1.1',
  })
  ip?: string;
}
