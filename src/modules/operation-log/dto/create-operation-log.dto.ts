import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { OperationType } from '../entities/operation-log.entity';

export class CreateOperationLogDto {
  @ApiProperty({
    description: '操作用户ID',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: '操作用户名',
    example: 'admin',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: '操作模块',
    example: '用户管理',
  })
  @IsNotEmpty()
  @IsString()
  module: string;

  @ApiProperty({
    description: '操作类型',
    enum: OperationType,
    example: OperationType.CREATE,
  })
  @IsNotEmpty()
  @IsEnum(OperationType)
  operationType: OperationType;

  @ApiProperty({
    description: '操作描述',
    example: '创建新用户',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: '请求方法',
    example: 'POST',
  })
  @IsNotEmpty()
  @IsString()
  method: string;

  @ApiProperty({
    description: '请求URL',
    example: '/api/users/create',
  })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({
    description: 'IP地址',
    example: '192.168.1.1',
  })
  @IsNotEmpty()
  @IsString()
  ip: string;

  @ApiProperty({
    description: '用户代理',
    example:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    required: false,
  })
  @IsString()
  userAgent?: string;
}
