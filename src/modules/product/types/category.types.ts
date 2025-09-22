import { Document, Types } from 'mongoose';
import { ProductCategory } from '../entities/product-category.entity';

/**
 * ProductCategory文档类型
 */
export interface ProductCategoryDocument extends ProductCategory, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ProductCategory的Lean文档类型（用于lean()查询结果）
 */
export type ProductCategoryLeanDocument = ProductCategory & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * 分类树节点接口
 */
export interface CategoryTreeNode extends Omit<ProductCategory, 'parentId'> {
  id: string;
  parentId: string | null;
  children: CategoryTreeNode[];
}
