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
import { ProductSPU } from './product-spu.entity';

export interface Specification {
  key: string;
  value: string;
}

@Entity()
export class ProductSKU {
  @ApiProperty({ description: 'SKU ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '关联的SPU ID' })
  @Column()
  spuId: string;

  @ApiProperty({ description: '规格属性' })
  @Column('jsonb')
  specifications: Specification[];

  @ApiProperty({ description: 'SKU图片', required: false })
  @Column({ nullable: true })
  image?: string;

  @ApiProperty({ description: '价格' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: '市场价', required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  marketPrice?: number;

  @ApiProperty({ description: '库存数量' })
  @Column({ default: 0 })
  stock: number;

  @ApiProperty({ description: 'SKU编码' })
  @Column({ unique: true })
  skuCode: string;

  @ApiProperty({ description: '状态', enum: [0, 1] })
  @Column({ default: 1 })
  status: number;

  @ManyToOne(() => ProductSPU, (spu) => spu.skus)
  @JoinColumn({ name: 'spuId' })
  spu: ProductSPU;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
