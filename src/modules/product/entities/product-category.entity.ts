import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { ProductSPU } from './product-spu.entity';

@Entity('product_categories')
@Tree('nested-set')
export class ProductCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TreeParent()
  parent: ProductCategory;

  @TreeChildren()
  children: ProductCategory[];

  @OneToMany(() => ProductSPU, (spu) => spu.category)
  products: ProductSPU[];

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  code: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
