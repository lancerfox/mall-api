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
import { Order } from './order.entity';

@Entity('shipping_info')
export class ShippingInfo {
  @ApiProperty({ description: '物流信息ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '订单ID' })
  @Column()
  orderId: string;

  @ApiProperty({ description: '物流公司' })
  @Column({ length: 100 })
  company: string;

  @ApiProperty({ description: '物流单号' })
  @Column({ length: 100 })
  trackingNumber: string;

  @ApiProperty({ description: '发货时间', required: false })
  @Column({ nullable: true })
  shippedAt?: Date;

  @ApiProperty({ description: '物流轨迹详情', required: false })
  @Column('jsonb', { nullable: true })
  trackingDetails?: Array<{
    time: string;
    status: string;
    location?: string;
  }>;

  @ApiProperty({ description: '物流备注', required: false })
  @Column({ length: 500, nullable: true })
  remark?: string;

  // 关联关系
  @ManyToOne(() => Order, (order) => order.shippings)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
