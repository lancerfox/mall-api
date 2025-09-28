import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductImage } from '../../product/entities/product-image.entity';

/**
 * 图片实体类
 */
@Entity('images')
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, comment: '图片在Supabase中的路径' })
  path: string;

  @Column({ type: 'varchar', length: 255, comment: '图片文件名' })
  name: string;

  @Column({ type: 'int', nullable: true, comment: '图片大小 (bytes)' })
  size?: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '图片MIME类型',
  })
  mimeType?: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联关系：一张图片可以被多个商品使用
  @OneToMany(() => ProductImage, (productImage) => productImage.image)
  productImages: ProductImage[];
}
