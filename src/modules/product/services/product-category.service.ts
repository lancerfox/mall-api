import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { Repository } from 'typeorm';
import { ProductCategory } from '../entities/product-category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { DeleteCategoryDto } from '../dto/delete-category.dto';
import { CategoryTreeNode } from '../types/category.types';
import { ProductCategoryResponseDto } from '../dto/product-category-response.dto';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
  ) {}

  /**
   * 创建商品分类
   */
  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<ProductCategoryResponseDto> {
    // 处理一级分类的情况
    // 如果没有提供 parentId 或 parentId 为 null/undefined，则创建一级分类
    const categoryData = {
      ...createCategoryDto,
      level: createCategoryDto.parentId ? 2 : 1, // 如果有父级则为二级分类，否则为一级分类
    };

    const category = this.categoryRepository.create(categoryData);
    const savedCategory = await this.categoryRepository.save(category);
    return this.transformToResponseDto(savedCategory);
  }

  /**
   * 更新商品分类
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<ProductCategoryResponseDto> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new BusinessException(ERROR_CODES.VALIDATION_INVALID_ID);
    }

    const updatedCategory = this.categoryRepository.merge(category, {
      ...updateCategoryDto,
      updatedAt: new Date(),
    });
    const savedCategory = await this.categoryRepository.save(updatedCategory);
    return this.transformToResponseDto(savedCategory);
  }

  /**
   * 删除商品分类
   */
  async delete(deleteCategoryDto: DeleteCategoryDto): Promise<void> {
    const { id } = deleteCategoryDto;
    const result = await this.categoryRepository.delete(id);

    if (result.affected === 0) {
      throw new BusinessException(ERROR_CODES.VALIDATION_INVALID_ID);
    }
  }

  /**
   * 获取分类列表（树形结构）
   */
  async findAll(): Promise<ProductCategoryResponseDto[]> {
    const categories = await this.categoryRepository.find({
      where: { enabled: true },
      order: { sort: 'ASC', createdAt: 'DESC' },
    });

    return categories.map((category) => this.transformToResponseDto(category));
  }

  /**
   * 获取分类详情
   */
  async findOne(id: string): Promise<ProductCategoryResponseDto> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new BusinessException(ERROR_CODES.VALIDATION_INVALID_ID);
    }

    return this.transformToResponseDto(category);
  }

  /**
   * 构建分类树形结构
   */
  async buildCategoryTree(): Promise<CategoryTreeNode[]> {
    const categories = await this.categoryRepository.find({
      where: { enabled: true },
      order: { sort: 'ASC' },
      relations: ['parent'],
    });

    const categoryMap = new Map<string, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // 创建映射
    categories.forEach((category) => {
      const categoryId = category.id;
      categoryMap.set(categoryId, {
        id: categoryId,
        parentId: category.parent?.id || null,
        name: category.name,
        code: category.code,
        level: category.level,
        description: category.description,
        icon: category.icon,
        sort: category.sort,
        enabled: category.enabled,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        children: [],
        products: [],
      });
    });

    // 构建树形结构
    categories.forEach((category) => {
      const categoryId = category.id;
      const mappedCategory = categoryMap.get(categoryId);

      if (mappedCategory) {
        if (category.parent) {
          const parent = categoryMap.get(category.parent.id);
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
    const count = await this.categoryRepository.count({
      where: { parent: { id } },
    });
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
      const children = await this.categoryRepository.find({
        where: { parent: { id: currentId } },
        select: ['id'],
      });

      children.forEach((child) => {
        const childId = child.id;
        descendantIds.push(childId);
        queue.push(childId);
      });
    }

    return descendantIds;
  }

  /**
   * 转换分类实体为响应DTO
   */
  private transformToResponseDto(
    category: ProductCategory,
  ): ProductCategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      code: category.code,
      parentId: category.parent?.id || undefined,
      level: category.level,
      sort: category.sort,
      enabled: category.enabled,
      icon: category.icon,
      description: category.description,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
