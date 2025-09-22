import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductCategory } from '../entities/product-category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { DeleteCategoryDto } from '../dto/delete-category.dto';
import {
  CategoryTreeNode,
  ProductCategoryLeanDocument,
} from '../types/category.types';
import { ProductCategoryResponseDto } from '../dto/product-category-response.dto';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectModel(ProductCategory.name)
    private readonly categoryModel: Model<ProductCategory>,
  ) {}

  /**
   * 创建商品分类
   */
  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<ProductCategoryResponseDto> {
    const category = new this.categoryModel(createCategoryDto);
    const savedCategory = await category.save();
    return this.transformToResponseDto(savedCategory);
  }

  /**
   * 更新商品分类
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<ProductCategoryResponseDto> {
    const updateData = updateCategoryDto;
    const category = await this.categoryModel.findByIdAndUpdate(
      id,
      { ...updateData, updateTime: new Date() },
      { new: true, runValidators: true },
    );

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return this.transformToResponseDto(category);
  }

  /**
   * 删除商品分类
   */
  async delete(deleteCategoryDto: DeleteCategoryDto): Promise<void> {
    const { id } = deleteCategoryDto;
    const result = await this.categoryModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('分类不存在');
    }
  }

  /**
   * 获取分类列表（树形结构）
   */
  async findAll(): Promise<ProductCategoryResponseDto[]> {
    const categories = await this.categoryModel
      .find({ status: 1 })
      .sort({ sort: 1, createTime: -1 })
      .lean()
      .exec();

    return categories.map(category => this.transformLeanToResponseDto(category));
  }

  /**
   * 获取分类详情
   */
  async findOne(id: string): Promise<ProductCategoryResponseDto> {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return this.transformToResponseDto(category);
  }

  /**
   * 构建分类树形结构
   */
  private buildCategoryTree(
    categories: ProductCategoryLeanDocument[],
  ): CategoryTreeNode[] {
    const categoryMap = new Map<string, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // 创建映射
    categories.forEach((category) => {
      const categoryId = category._id.toString();
      categoryMap.set(categoryId, {
        id: categoryId,
        parentId: category.parentId ? category.parentId.toString() : null,
        name: category.name,
        code: category.code,
        level: category.level,
        description: category.description,
        icon: category.icon,
        sort: category.sort,
        status: category.status,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        children: [],
      });
    });

    // 构建树形结构
    categories.forEach((category) => {
      const categoryId = category._id.toString();
      const mappedCategory = categoryMap.get(categoryId);

      if (mappedCategory) {
        if (category.parentId) {
          const parentId = category.parentId.toString();
          const parent = categoryMap.get(parentId);
          if (parent) {
            parent.children.push(mappedCategory);
          }
        } else {
          rootCategories.push(mappedCategory);
        }
      }
    });

    return rootCategories;
  }

  /**
   * 检查分类是否存在子分类
   */
  async hasChildren(id: string): Promise<boolean> {
    const count = await this.categoryModel.countDocuments({ parentId: id });
    return count > 0;
  }

  /**
   * 获取所有子分类ID（包括子分类的子分类）
   */
  async getAllDescendantIds(id: string): Promise<string[]> {
    const descendantIds: string[] = [];
    const queue: string[] = [id];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = await this.categoryModel.find(
        { parentId: currentId },
        { _id: 1 },
      );

      children.forEach((child) => {
        const childId = child._id.toString();
        descendantIds.push(childId);
        queue.push(childId);
      });
    }

    return descendantIds;
  }

  /**
   * 转换Lean文档为响应DTO
   */
  private transformLeanToResponseDto(
    category: ProductCategoryLeanDocument,
  ): ProductCategoryResponseDto {
    return {
      id: category._id.toString(),
      name: category.name,
      code: category.code,
      parentId: category.parentId
        ? category.parentId.toString()
        : undefined,
      level: category.level,
      sortOrder: category.sort,
      enabled: category.status === 1,
      icon: category.icon,
      description: category.description,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * 转换分类文档为响应DTO
   */
  private transformToResponseDto(
    category: ProductCategory,
  ): ProductCategoryResponseDto {
    const categoryObj = (category as any).toObject ? (category as any).toObject() : category;
    return {
      id: categoryObj._id.toString(),
      name: categoryObj.name,
      code: categoryObj.code,
      parentId: categoryObj.parentId
        ? categoryObj.parentId.toString()
        : undefined,
      level: categoryObj.level,
      sortOrder: categoryObj.sort,
      enabled: categoryObj.status === 1,
      icon: categoryObj.icon,
      description: categoryObj.description,
      createdAt: categoryObj.createdAt,
      updatedAt: categoryObj.updatedAt,
    };
  }
}
