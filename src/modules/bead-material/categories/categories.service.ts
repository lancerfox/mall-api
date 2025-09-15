import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BeadCategory, BeadCategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('BeadCategory')
    private readonly categoryModel: Model<BeadCategoryDocument>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    userId: string,
  ): Promise<BeadCategory> {
    // 检查分类名称是否重复
    const existingCategory = await this.categoryModel.findOne({
      name: createCategoryDto.name,
      parent_id: createCategoryDto.parent_id || null,
    });

    if (existingCategory) {
      throw new ConflictException('同一层级下分类名称不能重复');
    }

    // 验证父级分类是否存在
    if (createCategoryDto.parent_id) {
      const parentCategory = await this.categoryModel.findById(
        createCategoryDto.parent_id,
      );
      if (!parentCategory) {
        throw new BadRequestException('父级分类不存在');
      }
    }

    const category = new this.categoryModel({
      ...createCategoryDto,
      created_by: new Types.ObjectId(userId),
      updated_by: new Types.ObjectId(userId),
      parent_id: createCategoryDto.parent_id
        ? new Types.ObjectId(createCategoryDto.parent_id)
        : null,
    });

    return await category.save();
  }

  async findAll(query: QueryCategoryDto): Promise<BeadCategory[]> {
    const filter: any = {};

    if (query.parent_id) {
      filter.parent_id = new Types.ObjectId(query.parent_id);
    } else {
      filter.parent_id = null;
    }

    if (query.keyword) {
      filter.name = { $regex: query.keyword, $options: 'i' };
    }

    if (typeof query.is_active === 'boolean') {
      filter.is_active = query.is_active;
    }

    return await this.categoryModel
      .find(filter)
      .populate('children')
      .sort({ sort_order: 1, created_at: -1 })
      .exec();
  }

  async findOne(id: string): Promise<BeadCategory | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('无效的分类ID');
    }

    const category = await this.categoryModel
      .findById(id)
      .populate('children')
      .exec();

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ): Promise<BeadCategory | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('无效的分类ID');
    }

    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 检查名称是否重复（排除当前分类）
    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryModel.findOne({
        name: updateCategoryDto.name,
        parent_id: updateCategoryDto.parent_id || category.parent_id || null,
        _id: { $ne: id },
      });

      if (existingCategory) {
        throw new ConflictException('同一层级下分类名称不能重复');
      }
    }

    // 验证父级分类是否存在
    if (updateCategoryDto.parent_id) {
      const parentCategory = await this.categoryModel.findById(
        updateCategoryDto.parent_id,
      );
      if (!parentCategory) {
        throw new BadRequestException('父级分类不存在');
      }

      // 防止循环引用
      if (id === updateCategoryDto.parent_id) {
        throw new BadRequestException('不能将分类设置为自己的父级');
      }
    }

    const updateData: any = {
      ...updateCategoryDto,
      updated_by: new Types.ObjectId(userId),
    };

    if (updateCategoryDto.parent_id) {
      updateData.parent_id = new Types.ObjectId(updateCategoryDto.parent_id);
    }

    return await this.categoryModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('无效的分类ID');
    }

    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 检查是否有子分类
    const childCount = await this.categoryModel.countDocuments({
      parent_id: id,
    });
    if (childCount > 0) {
      throw new BadRequestException('该分类下存在子分类，无法删除');
    }

    // 检查是否有材料关联
    // 这里需要等材料服务创建后再实现材料数量检查

    await this.categoryModel.findByIdAndDelete(id).exec();
  }

  async search(keyword: string): Promise<BeadCategory[]> {
    if (!keyword || keyword.trim().length === 0) {
      return [];
    }

    return await this.categoryModel
      .find({
        name: { $regex: keyword.trim(), $options: 'i' },
        is_active: true,
      })
      .sort({ sort_order: 1, name: 1 })
      .limit(20)
      .exec();
  }
}
