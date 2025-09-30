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
import { ProductSPU } from '../../product/entities/product-spu.entity';
import { ProductSKU } from '../../product/entities/product-sku.entity';

@Entity('order_items')
export class OrderItem {
  @ApiProperty({ description: '订单项ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '订单ID' })
  @Column()
  orderId: string;

  @ApiProperty({ description: '商品SPU ID' })
  @Column()
  spuId: string;

  @ApiProperty({ description: '商品SKU ID' })
  @Column()
  skuId: string;

  @ApiProperty({ description: '商品名称' })
  @Column({ length: 200 })
  productName: string;

  @ApiProperty({ description: '商品图片' })
  @Column({ nullable: true })
  productImage?: string;

  @ApiProperty({ description: 'SKU规格描述' })
  @Column({ length: 500 })
  skuSpec: string;

  @ApiProperty({ description: '商品单价' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: '购买数量' })
  @Column()
  quantity: number;

  @ApiProperty({ description: '小计金额' })
  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  // 关联关系
  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => ProductSPU)
  @JoinColumn({ name: 'spuId' })
  spu: ProductSPU;

  @ManyToOne(() => ProductSKU)
  @JoinColumn({ name: 'skuId' })
  sku: ProductSKU;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
