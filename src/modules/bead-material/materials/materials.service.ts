import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BeadMaterial, BeadMaterialDocument } from './schemas/material.schema';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectModel('BeadMaterial')
    private readonly materialModel: Model<BeadMaterialDocument>,
  ) {}

  async create(
    createMaterialDto: CreateMaterialDto,
    userId: string,
  ): Promise<BeadMaterial> {
    // 检查材料名称是否重复（同一分类下）
    const existingMaterial = await this.materialModel.findOne({
      name: createMaterialDto.name,
      category_id: createMaterialDto.category_id,
    });

    if (existingMaterial) {
      throw new ConflictException('同一分类下材料名称不能重复');
    }

    const material = new this.materialModel({
      ...createMaterialDto,
      created_by: new Types.ObjectId(userId),
      updated_by: new Types.ObjectId(userId),
      category_id: new Types.ObjectId(createMaterialDto.category_id),
    });

    return await material.save();
  }

  async findAll(
    query: QueryMaterialDto,
  ): Promise<{ materials: BeadMaterial[]; total: number }> {
    const filter: any = {};
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    if (query.category_id) {
      filter.category_id = new Types.ObjectId(query.category_id);
    }

    if (query.keyword) {
      filter.$or = [
        { name: { $regex: query.keyword, $options: 'i' } },
        { specification: { $regex: query.keyword, $options: 'i' } },
        { color: { $regex: query.keyword, $options: 'i' } },
        { description: { $regex: query.keyword, $options: 'i' } },
      ];
    }

    if (typeof query.is_active === 'boolean') {
      filter.is_active = query.is_active;
    }

    const [materials, total] = await Promise.all([
      this.materialModel
        .find(filter)
        .populate('category_id', 'name')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.materialModel.countDocuments(filter),
    ]);

    return { materials, total };
  }

  async findOne(id: string): Promise<BeadMaterial | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('无效的材料ID');
    }

    const material = await this.materialModel
      .findById(id)
      .populate('category_id', 'name')
      .exec();

    if (!material) {
      throw new NotFoundException('材料不存在');
    }

    return material;
  }

  async update(
    id: string,
    updateMaterialDto: UpdateMaterialDto,
    userId: string,
  ): Promise<BeadMaterial | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('无效的材料ID');
    }

    const material = await this.materialModel.findById(id);
    if (!material) {
      throw new NotFoundException('材料不存在');
    }

    // 检查名称是否重复（排除当前材料）
    if (updateMaterialDto.name) {
      const existingMaterial = await this.materialModel.findOne({
        name: updateMaterialDto.name,
        category_id: updateMaterialDto.category_id || material.category_id,
        _id: { $ne: id },
      });

      if (existingMaterial) {
        throw new ConflictException('同一分类下材料名称不能重复');
      }
    }

    const updateData: any = {
      ...updateMaterialDto,
      updated_by: new Types.ObjectId(userId),
    };

    if (updateMaterialDto.category_id) {
      updateData.category_id = new Types.ObjectId(
        updateMaterialDto.category_id,
      );
    }

    return await this.materialModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('category_id', 'name')
      .exec();
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('无效的材料ID');
    }

    const material = await this.materialModel.findById(id);
    if (!material) {
      throw new NotFoundException('材料不存在');
    }

    await this.materialModel.findByIdAndDelete(id).exec();
  }

  async search(keyword: string, categoryId?: string): Promise<BeadMaterial[]> {
    if (!keyword || keyword.trim().length === 0) {
      return [];
    }

    const filter: any = {
      $or: [
        { name: { $regex: keyword.trim(), $options: 'i' } },
        { specification: { $regex: keyword.trim(), $options: 'i' } },
        { color: { $regex: keyword.trim(), $options: 'i' } },
      ],
      is_active: true,
    };

    if (categoryId) {
      filter.category_id = new Types.ObjectId(categoryId);
    }

    return await this.materialModel
      .find(filter)
      .populate('category_id', 'name')
      .sort({ name: 1 })
      .limit(20)
      .exec();
  }

  async updateStock(
    id: string,
    quantity: number,
    userId: string,
  ): Promise<BeadMaterial | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('无效的材料ID');
    }

    const material = await this.materialModel.findById(id);
    if (!material) {
      throw new NotFoundException('材料不存在');
    }

    if (quantity < 0) {
      throw new BadRequestException('库存数量不能为负数');
    }

    return await this.materialModel
      .findByIdAndUpdate(
        id,
        {
          stock_quantity: quantity,
          updated_by: new Types.ObjectId(userId),
        },
        { new: true },
      )
      .exec();
  }
}
