import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
  OrderStatus,
  OrderCloseReason,
} from '../../../common/enums/order-status.enum';
import { User } from '../../user/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { PaymentInfo } from './payment-info.entity';
import { ShippingInfo } from './shipping-info.entity';
import { OrderOperationLog } from './order-operation-log.entity';

@Entity('orders')
export class Order {
  @ApiProperty({ description: '订单ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '订单编号' })
  @Column({ unique: true, length: 32 })
  orderNumber: string;

  @ApiProperty({ description: '用户ID' })
  @Column()
  userId: string;

  @ApiProperty({ description: '订单状态' })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING_PAYMENT,
  })
  status: OrderStatus;

  @ApiProperty({ description: '订单总金额' })
  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @ApiProperty({ description: '商品总金额' })
  @Column('decimal', { precision: 10, scale: 2 })
  itemsAmount: number;

  @ApiProperty({ description: '运费' })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  shippingFee: number;

  @ApiProperty({ description: '优惠金额' })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @ApiProperty({ description: '收货人姓名' })
  @Column({ length: 50 })
  receiverName: string;

  @ApiProperty({ description: '收货人电话' })
  @Column({ length: 20 })
  receiverPhone: string;

  @ApiProperty({ description: '收货地址' })
  @Column({ length: 500 })
  receiverAddress: string;

  @ApiProperty({ description: '订单备注', required: false })
  @Column({ length: 500, nullable: true })
  remark?: string;

  @ApiProperty({ description: '关闭原因', required: false })
  @Column({
    type: 'enum',
    enum: OrderCloseReason,
    nullable: true,
  })
  closeReason?: OrderCloseReason;

  @ApiProperty({ description: '关闭备注', required: false })
  @Column({ length: 200, nullable: true })
  closeRemark?: string;

  @ApiProperty({ description: '支付时间', required: false })
  @Column({ nullable: true })
  paidAt?: Date;

  @ApiProperty({ description: '发货时间', required: false })
  @Column({ nullable: true })
  shippedAt?: Date;

  @ApiProperty({ description: '完成时间', required: false })
  @Column({ nullable: true })
  completedAt?: Date;

  @ApiProperty({ description: '关闭时间', required: false })
  @Column({ nullable: true })
  closedAt?: Date;

  // 关联关系
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => PaymentInfo, (payment) => payment.order, { cascade: true })
  payments: PaymentInfo[];

  @OneToMany(() => ShippingInfo, (shipping) => shipping.order, {
    cascade: true,
  })
  shippings: ShippingInfo[];

  @OneToMany(() => OrderOperationLog, (log) => log.order, { cascade: true })
  operationLogs: OrderOperationLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
