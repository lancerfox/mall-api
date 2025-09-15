import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../entities/category.entity';
import {
  Material,
  MaterialDocument,
} from '../../material/entities/material.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { MoveCategoryDto } from '../dto/move-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    userId: string,
  ): Promise<Category> {
    const { name, parentId, description, sortOrder = 0 } = createCategoryDto;

    let level = 1;
    let path = '';

    // 如果有父分类，验证父分类是否存在并计算层级和路径
    if (parentId) {
      const parentCategory = await this.categoryModel.findOne({
        categoryId: parentId,
      });
      if (!parentCategory) {
        throw new BadRequestException('父分类不存在');
      }
      level = parentCategory.level + 1;
      path = `${parentCategory.path}/${parentId}`;
    } else {
      path = '';
    }

    // 检查同级分类名称是否重复
    const existingCategory = await this.categoryModel.findOne({
      name,
      parentId: parentId || null,
    });
    if (existingCategory) {
      throw new BadRequestException('同级分类名称不能重复');
    }

    const categoryId = `C${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    const category = new this.categoryModel({
      categoryId,
      name,
      parentId: parentId || null,
      description,
      sortOrder,
      level,
      path: path ? `${path}/${categoryId}` : `/${categoryId}`,
      materialCount: 0,
      status: 'enabled',
      createdBy: userId,
      updatedBy: userId,
    });

    return await category.save();
  }

  async findTree(): Promise<any[]> {
    const categories = await this.categoryModel
      .find({ status: 'enabled' })
      .sort({ level: 1, sortOrder: 1 })
      .lean();

    return this.buildTree(categories);
  }

  async findAll(): Promise<any[]> {
    const categories = await this.categoryModel
      .find({ status: 'enabled' })
      .sort({ level: 1, sortOrder: 1 })
      .select('categoryId name parentId level path')
      .lean();

    return categories;
  }

  async update(
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ): Promise<Category> {
    const { categoryId, name, parentId, description, sortOrder } =
      updateCategoryDto;

    const existingCategory = await this.categoryModel.findOne({ categoryId });
    if (!existingCategory) {
      throw new NotFoundException('分类不存在');
    }

    let level = 1;
    let path = '';

    // 如果有父分类，验证父分类是否存在并计算层级和路径
    if (parentId) {
      const parentCategory = await this.categoryModel.findOne({
        categoryId: parentId,
      });
      if (!parentCategory) {
        throw new BadRequestException('父分类不存在');
      }
      level = parentCategory.level + 1;
      path = `${parentCategory.path}/${categoryId}`;
    } else {
      path = `/${categoryId}`;
    }

    // 检查同级分类名称是否重复（排除自己）
    if (
      name !== existingCategory.name ||
      parentId !== existingCategory.parentId
    ) {
      const duplicateCategory = await this.categoryModel.findOne({
        name,
        parentId: parentId || null,
        categoryId: { $ne: categoryId },
      });
      if (duplicateCategory) {
        throw new BadRequestException('同级分类名称不能重复');
      }
    }

    const updatedCategory = await this.categoryModel.findOneAndUpdate(
      { categoryId },
      {
        name,
        parentId: parentId || null,
        description,
        sortOrder:
          sortOrder !== undefined ? sortOrder : existingCategory.sortOrder,
        level,
        path,
        updatedBy: userId,
      },
      { new: true },
    );

    // 如果路径发生变化，需要更新所有子分类的路径
    if (path !== existingCategory.path) {
      await this.updateChildrenPaths(categoryId, path);
    }

    return updatedCategory!;
  }

  async remove(categoryId: string): Promise<void> {
    const category = await this.categoryModel.findOne({ categoryId });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 检查是否有子分类
    const childrenCount = await this.categoryModel.countDocuments({
      parentId: categoryId,
    });
    if (childrenCount > 0) {
      throw new BadRequestException('分类下存在子分类，无法删除');
    }

    // 检查是否有材料
    const materialCount = await this.materialModel.countDocuments({
      categoryId,
    });
    if (materialCount > 0) {
      throw new BadRequestException('分类下存在材料，无法删除');
    }

    await this.categoryModel.deleteOne({ categoryId });
  }

  async move(
    moveCategoryDto: MoveCategoryDto,
    userId: string,
  ): Promise<Category> {
    const { categoryId, targetParentId, sortOrder } = moveCategoryDto;

    const category = await this.categoryModel.findOne({ categoryId });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    let level = 1;
    let path = '';

    // 如果有目标父分类，验证父分类是否存在
    if (targetParentId) {
      const targetParent = await this.categoryModel.findOne({
        categoryId: targetParentId,
      });
      if (!targetParent) {
        throw new BadRequestException('目标父分类不存在');
      }

      // 检查是否试图移动到自己的子分类下
      if (
        targetParent.path.includes(`/${categoryId}/`) ||
        targetParent.path.endsWith(`/${categoryId}`)
      ) {
        throw new BadRequestException('不能将分类移动到自己的子分类下');
      }

      level = targetParent.level + 1;
      path = `${targetParent.path}/${categoryId}`;
    } else {
      path = `/${categoryId}`;
    }

    const updatedCategory = await this.categoryModel.findOneAndUpdate(
      { categoryId },
      {
        parentId: targetParentId || null,
        level,
        path,
        sortOrder,
        updatedBy: userId,
      },
      { new: true },
    );

    // 更新所有子分类的路径
    await this.updateChildrenPaths(categoryId, path);

    return updatedCategory!;
  }

  private buildTree(categories: any[], parentId: string | null = null): any[] {
    const children = categories.filter((cat) => cat.parentId === parentId);

    return children.map((category) => ({
      categoryId: category.categoryId,
      name: category.name,
      parentId: category.parentId,
      description: category.description,
      sortOrder: category.sortOrder,
      level: category.level,
      materialCount: category.materialCount,
      status: category.status,
      children: this.buildTree(categories, category.categoryId),
    }));
  }

  private async updateChildrenPaths(
    categoryId: string,
    newPath: string,
  ): Promise<void> {
    const children = await this.categoryModel.find({
      path: { $regex: `/${categoryId}/` },
    });

    for (const child of children) {
      const oldPath = child.path;
      const newChildPath = oldPath.replace(
        new RegExp(`/${categoryId}/`),
        `${newPath}/`,
      );

      await this.categoryModel.updateOne(
        { categoryId: child.categoryId },
        { path: newChildPath },
      );
    }
  }
}
