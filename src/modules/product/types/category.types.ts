import { ProductCategory } from '../entities/product-category.entity';

/**
 * 分类树节点接口
 */
export interface CategoryTreeNode
  extends Omit<ProductCategory, 'parentId' | 'parent' | 'children'> {
  id: string;
  parentId: string | null;
  children: CategoryTreeNode[];
}
