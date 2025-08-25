import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建操作日志数据传输对象
 */
export class CreateOperationLogDto {
  @ApiProperty({
    description: '用户ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: '用户名',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: '操作动作',
    example: 'create',
  })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({
    description: '操作模块',
    example: 'user',
  })
  @IsString()
  @IsNotEmpty()
  module: string;

  @ApiPropertyOptional({
    description: '操作描述',
    example: '创建用户',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'IP地址',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiPropertyOptional({
    description: '用户代理',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    description: '请求数据',
    example: { username: 'newuser', email: 'newuser@example.com' },
  })
  @IsOptional()
  @IsObject()
  requestData?: any;

  @ApiPropertyOptional({
    description: '响应数据',
    example: { id: '507f1f77bcf86cd799439011', success: true },
  })
  @IsOptional()
  @IsObject()
  responseData?: any;

  @ApiPropertyOptional({
    description: '操作状态',
    example: 'success',
    enum: ['success', 'error'],
  })
  @IsOptional()
  @IsEnum(['success', 'error'])
  status?: string;

  @ApiPropertyOptional({
    description: '错误信息',
    example: '用户名已存在',
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({
    description: '执行时间（毫秒）',
    example: 150,
  })
  @IsOptional()
  @IsNumber()
  executionTime?: number;

  @ApiPropertyOptional({
    description: 'HTTP方法',
    example: 'POST',
  })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({
    description: '请求URL',
    example: '/api/users',
  })
  @IsOptional()
  @IsString()
  url?: string;
}
