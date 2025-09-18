import { Injectable, HttpException } from '@nestjs/common';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, MaterialDocument } from '../entities/material.entity';
import {
  Category,
  CategoryDocument,
} from '../../category/entities/category.entity';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { MaterialListDto } from '../dto/material-list.dto';
import { BatchDeleteMaterialDto } from '../dto/batch-delete-material.dto';
import { ToggleStatusDto } from '../dto/toggle-status.dto';

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(
    createMaterialDto: CreateMaterialDto,
    userId: string,
  ): Promise<Material> {
    // 验证分类是否存在
    const category = await this.categoryModel.findOne({
      categoryId: createMaterialDto.categoryId,
    });
    if (!category) {
      throw new HttpException('分类不存在', ERROR_CODES.CATEGORY_NOT_FOUND);
    }

    // 检查材料名称是否已存在
    const existingMaterial = await this.materialModel.findOne({
      name: createMaterialDto.name,
    });
    if (existingMaterial) {
      throw new HttpException(
        '材料名称已存在',
        ERROR_CODES.MATERIAL_ALREADY_EXISTS,
      );
    }

    const materialId = `M${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    const material = new this.materialModel({
      ...createMaterialDto,
      materialId,
      status: createMaterialDto.status || 'enabled',
      createdBy: userId,
      updatedBy: userId,
    });

    const savedMaterial = await material.save();

    // 更新分类的材料数量
    await this.categoryModel.updateOne(
      { categoryId: createMaterialDto.categoryId },
      { $inc: { materialCount: 1 } },
    );

    return savedMaterial;
  }

  async findAll(query: MaterialListDto): Promise<{
    list: any[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { 
      page, 
      pageSize, 
      keyword, 
      categoryId, 
      categoryIds,
      status,
      statuses,
      priceMin,
      priceMax,
      stockMin,
      stockMax,
      colors,
      hardnessMin,
      hardnessMax,
      densityMin,
      densityMax,
      dateStart,
      dateEnd,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const filter: any = {};

    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { color: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (categoryIds && categoryIds.length > 0) {
      filter.categoryId = { $in: categoryIds };
    }

    if (status) {
      filter.status = status;
    }

    if (statuses && statuses.length > 0) {
      filter.status = { $in: statuses };
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      filter.price = {};
      if (priceMin !== undefined) filter.price.$gte = priceMin;
      if (priceMax !== undefined) filter.price.$lte = priceMax;
    }

    if (stockMin !== undefined || stockMax !== undefined) {
      filter.stock = {};
      if (stockMin !== undefined) filter.stock.$gte = stockMin;
      if (stockMax !== undefined) filter.stock.$lte = stockMax;
    }

    if (colors && colors.length > 0) {
      filter.color = { $in: colors };
    }

    if (hardnessMin !== undefined || hardnessMax !== undefined) {
      filter.hardness = {};
      if (hardnessMin !== undefined) filter.hardness.$gte = hardnessMin;
      if (hardnessMax !== undefined) filter.hardness.$lte = hardnessMax;
    }

    if (densityMin !== undefined || densityMax !== undefined) {
      filter.density = {};
      if (densityMin !== undefined) filter.density.$gte = densityMin;
      if (densityMax !== undefined) filter.density.$lte = densityMax;
    }

    if (dateStart || dateEnd) {
      filter.createdAt = {};
      if (dateStart) filter.createdAt.$gte = new Date(dateStart);
      if (dateEnd) filter.createdAt.$lte = new Date(dateEnd);
    }

    // 构建排序条件
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [materials, total] = await Promise.all([
      this.materialModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      this.materialModel.countDocuments(filter),
    ]);

    // 获取分类信息
    const uniqueCategoryIds = [...new Set(materials.map((m) => m.categoryId))];
    const categories = await this.categoryModel
      .find({ categoryId: { $in: uniqueCategoryIds } })
      .lean();

    const categoryMap = new Map(categories.map((c) => [c.categoryId, c.name]));

    const list = materials.map((material) => ({
      materialId: material.materialId,
      name: material.name,
      categoryId: material.categoryId,
      categoryName: categoryMap.get(material.categoryId) || '',
      price: material.price,
      stock: material.stock,
      description: material.description,
      color: material.color,
      hardness: material.hardness,
      density: material.density,
      status: material.status,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
    }));

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(materialId: string): Promise<Material> {
    const material = await this.materialModel.findOne({ materialId }).lean();
    if (!material) {
      throw new HttpException('材料不存在', ERROR_CODES.MATERIAL_NOT_FOUND);
    }
    return material;
  }

  async update(
    updateMaterialDto: UpdateMaterialDto,
    userId: string,
  ): Promise<Material> {
    const { materialId, ...updateData } = updateMaterialDto;

    // 验证材料是否存在
    const existingMaterial = await this.materialModel.findOne({ materialId });
    if (!existingMaterial) {
      throw new HttpException('材料不存在', ERROR_CODES.MATERIAL_NOT_FOUND);
    }

    // 验证分类是否存在
    const category = await this.categoryModel.findOne({
      categoryId: updateData.categoryId,
    });
    if (!category) {
      throw new HttpException('分类不存在', ERROR_CODES.CATEGORY_NOT_FOUND);
    }

    // 检查材料名称是否已被其他材料使用
    if (updateData.name !== existingMaterial.name) {
      const duplicateMaterial = await this.materialModel.findOne({
        name: updateData.name,
        materialId: { $ne: materialId },
      });
      if (duplicateMaterial) {
        throw new HttpException(
          '材料名称已存在',
          ERROR_CODES.MATERIAL_ALREADY_EXISTS,
        );
      }
    }

    // 如果分类发生变化，更新分类的材料数量
    if (updateData.categoryId !== existingMaterial.categoryId) {
      await Promise.all([
        this.categoryModel.updateOne(
          { categoryId: existingMaterial.categoryId },
          { $inc: { materialCount: -1 } },
        ),
        this.categoryModel.updateOne(
          { categoryId: updateData.categoryId },
          { $inc: { materialCount: 1 } },
        ),
      ]);
    }

    const updatedMaterial = await this.materialModel.findOneAndUpdate(
      { materialId },
      { ...updateData, updatedBy: userId },
      { new: true },
    );

    return updatedMaterial!;
  }

  async remove(materialId: string): Promise<void> {
    const material = await this.materialModel.findOne({ materialId });
    if (!material) {
      throw new HttpException('材料不存在', ERROR_CODES.MATERIAL_NOT_FOUND);
    }

    await this.materialModel.deleteOne({ materialId });

    // 更新分类的材料数量
    await this.categoryModel.updateOne(
      { categoryId: material.categoryId },
      { $inc: { materialCount: -1 } },
    );
  }

  async batchDelete(batchDeleteDto: BatchDeleteMaterialDto): Promise<{
    successCount: number;
    failedCount: number;
    failedIds: string[];
  }> {
    const { materialIds } = batchDeleteDto;
    const successIds: string[] = [];
    const failedIds: string[] = [];

    for (const materialId of materialIds) {
      try {
        await this.remove(materialId);
        successIds.push(materialId);
      } catch (error) {
        failedIds.push(materialId);
      }
    }

    return {
      successCount: successIds.length,
      failedCount: failedIds.length,
      failedIds,
    };
  }

  async toggleStatus(
    toggleStatusDto: ToggleStatusDto,
    userId: string,
  ): Promise<Material> {
    const { materialId, status } = toggleStatusDto;

    const material = await this.materialModel.findOne({ materialId });
    if (!material) {
      throw new HttpException('材料不存在', ERROR_CODES.MATERIAL_NOT_FOUND);
    }

    const updatedMaterial = await this.materialModel.findOneAndUpdate(
      { materialId },
      { status, updatedBy: userId },
      { new: true },
    );

    return updatedMaterial!;
  }
}
