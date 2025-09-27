import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductSPU } from './product-spu.entity';
import { Image } from '../../image/entities/image.entity';

/**
 * 商品图片关联实体类
 */
@Entity('product_images')
export class ProductImage {
  @PrimaryColumn({ comment: '商品ID' })
  productId: string;

  @PrimaryColumn({ comment: '图片ID' })
  imageId: number;

  @Column({ type: 'int', default: 0, comment: '显示顺序' })
  sortOrder: number;

  @Column({ type: 'boolean', default: false, comment: '是否为主图' })
  isMain: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => ProductSPU, (product) => product.productImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: ProductSPU;

  @ManyToOne(() => Image, (image) => image.productImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'imageId' })
  image: Image;
}
