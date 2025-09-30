import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
  PaymentMethod,
  PaymentStatus,
} from '../../../common/enums/order-status.enum';
import { Order } from './order.entity';

@Entity('payment_info')
export class PaymentInfo {
  @ApiProperty({ description: '支付信息ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '订单ID' })
  @Column()
  orderId: string;

  @ApiProperty({ description: '支付方式' })
  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @ApiProperty({ description: '支付状态' })
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ApiProperty({ description: '支付金额' })
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: '第三方交易号', required: false })
  @Column({ length: 100, nullable: true })
  transactionId?: string;

  @ApiProperty({ description: '支付时间', required: false })
  @Column({ nullable: true })
  paidAt?: Date;

  @ApiProperty({ description: '支付备注', required: false })
  @Column({ length: 500, nullable: true })
  remark?: string;

  // 关联关系
  @ManyToOne(() => Order, (order) => order.payments)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
