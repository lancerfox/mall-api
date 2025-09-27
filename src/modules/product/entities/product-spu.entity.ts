import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductSKU } from './product-sku.entity';
import { ProductCategory } from './product-category.entity';
import { ProductImage } from './product-image.entity';

@Entity()
export class ProductSPU {
  @ApiProperty({ description: 'SPU ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '商品名称' })
  @Column({ length: 200 })
  name: string;

  @ApiProperty({ description: '副标题', required: false })
  @Column({ length: 500, nullable: true })
  subtitle?: string;

  @ApiProperty({ description: '分类ID' })
  @Column()
  categoryId: string;

  @ManyToOne(() => ProductCategory, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: ProductCategory;

  @ApiProperty({ description: '主图', required: false })
  @Column({ nullable: true })
  mainImage?: string;

  @ApiProperty({ description: '视频', required: false })
  @Column({ nullable: true })
  video?: string;

  @ApiProperty({ description: '材质' })
  @Column({ length: 50 })
  material: string;

  @ApiProperty({ description: '产地', required: false })
  @Column({ length: 50, nullable: true })
  origin?: string;

  @ApiProperty({ description: '等级', required: false })
  @Column({ length: 50, nullable: true })
  grade?: string;

  @ApiProperty({ description: '描述', required: false })
  @Column({ length: 2000, nullable: true })
  description?: string;

  @ApiProperty({ description: '运费' })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  freight: number;

  @ApiProperty({ description: '排序' })
  @Column({ default: 0 })
  sort: number;

  @ApiProperty({
    description: '状态',
    enum: ['Draft', 'On-shelf', 'Off-shelf'],
  })
  @Column({ default: 'Draft' })
  status: string;

  @OneToMany(() => ProductSKU, (sku) => sku.spu)
  skus: ProductSKU[];

  @OneToMany(() => ProductImage, (productImage) => productImage.product)
  productImages: ProductImage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
