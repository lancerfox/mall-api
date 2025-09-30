import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';
import { User } from '../../user/entities/user.entity';

@Entity('order_operation_logs')
export class OrderOperationLog {
  @ApiProperty({ description: '操作日志ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '订单ID' })
  @Column()
  orderId: string;

  @ApiProperty({ description: '操作人ID', required: false })
  @Column({ nullable: true })
  operatorId?: string;

  @ApiProperty({ description: '操作人姓名' })
  @Column({ length: 50 })
  operatorName: string;

  @ApiProperty({ description: '操作类型' })
  @Column({ length: 50 })
  action: string;

  @ApiProperty({ description: '操作描述' })
  @Column({ length: 500 })
  description: string;

  @ApiProperty({ description: '操作前状态', required: false })
  @Column({ length: 50, nullable: true })
  beforeStatus?: string;

  @ApiProperty({ description: '操作后状态', required: false })
  @Column({ length: 50, nullable: true })
  afterStatus?: string;

  @ApiProperty({ description: '操作备注', required: false })
  @Column({ length: 500, nullable: true })
  remark?: string;

  // 关联关系
  @ManyToOne(() => Order, (order) => order.operationLogs)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'operatorId' })
  operator?: User;

  @CreateDateColumn()
  createdAt: Date;
}
