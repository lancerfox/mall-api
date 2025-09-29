import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  QUERY = 'query',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
}

@Entity('operation_logs')
export class OperationLog {
  @ApiProperty({ description: '日志ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '操作用户ID' })
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ApiProperty({ description: '操作用户名' })
  @Column({ type: 'varchar', length: 50 })
  username: string;

  @ApiProperty({ description: '操作模块' })
  @Column({ type: 'varchar', length: 50 })
  module: string;

  @ApiProperty({ description: '操作类型', enum: OperationType })
  @Column({
    type: 'enum',
    enum: OperationType,
  })
  operationType: OperationType;

  @ApiProperty({ description: '操作描述' })
  @Column({ type: 'varchar', length: 500 })
  description: string;

  @ApiProperty({ description: '请求方法' })
  @Column({ type: 'varchar', length: 10 })
  method: string;

  @ApiProperty({ description: '请求URL' })
  @Column({ type: 'varchar', length: 500 })
  url: string;

  @ApiProperty({ description: 'IP地址' })
  @Column({ type: 'varchar', length: 45 })
  ip: string;

  @ApiProperty({ description: '用户代理' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent?: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;
}
