import { Injectable, HttpException, Inject } from '@nestjs/common';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryService } from '../../inventory/services/inventory.service';
import { Material, MaterialDocument } from '../entities/material.entity';
import {
  Category,
  CategoryDocument,
} from '../../category/entities/category.entity';
import {
  MaterialImage,
  MaterialImageDocument,
} from '../entities/material-image.entity';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { MaterialListDto } from '../dto/material-list.dto';
import { MaterialDetailDto } from '../dto/material-detail.dto';
import { ToggleStatusDto } from '../dto/toggle-status.dto';
import { MaterialStatsDto } from '../dto/material-response.dto';

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(MaterialImage.name)
    private imageModel: Model<MaterialImageDocument>,
    private readonly inventoryService: InventoryService,
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

    const materialId = `M${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    const material = new this.materialModel({
      ...createMaterialDto,
      materialId,
      status: createMaterialDto.status || 'enabled',
      createdBy: userId,
      updatedBy: userId,
    });

    const savedMaterial = await material.save();

    // 创建关联的库存记录
    await this.inventoryService.create(savedMaterial.materialId);

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
      colors,
      hardnessMin,
      hardnessMax,
      densityMin,
      densityMax,
      dateStart,
      dateEnd,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const filter: any = { deletedAt: null }; // 添加软删除过滤条件

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

    if (colors && colors.length > 0) {
      filter.color = { $in: colors };
    }

    if (hardnessMin !== undefined) {
      filter.hardness = { ...filter.hardness, $gte: hardnessMin };
    }

    if (hardnessMax !== undefined) {
      filter.hardness = { ...filter.hardness, $lte: hardnessMax };
    }

    if (densityMin !== undefined) {
      filter.density = { ...filter.density, $gte: densityMin };
    }

    if (densityMax !== undefined) {
      filter.density = { ...filter.density, $lte: densityMax };
    }

    if (dateStart) {
      filter.createdAt = { ...filter.createdAt, $gte: new Date(dateStart) };
    }

    if (dateEnd) {
      filter.createdAt = { ...filter.createdAt, $lte: new Date(dateEnd) };
    }

    const total = await this.materialModel.countDocuments(filter);

    // 构建排序条件
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // 执行查询
    const materials = await this.materialModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .lean();

    // 获取分类信息
    const categoryIdsInResult = [
      ...new Set(materials.map((m) => m.categoryId)),
    ];
    const categories = await this.categoryModel
      .find({ categoryId: { $in: categoryIdsInResult } })
      .select('categoryId name path')
      .lean();

    const categoryMap = new Map(
      categories.map((c) => [c.categoryId, { name: c.name, path: c.path }]),
    );

    // 获取图片信息
    const materialIds = materials.map((m) => m.materialId);
    const images = await this.imageModel
      .find({ materialId: { $in: materialIds } })
      .select('materialId url')
      .lean();

    const imageMap = new Map<string, string[]>();
    images.forEach((img) => {
      if (!imageMap.has(img.materialId)) {
        imageMap.set(img.materialId, []);
      }
      imageMap.get(img.materialId)!.push(img.url);
    });

    // 组装结果
    const list = materials.map((material) => {
      const categoryInfo = categoryMap.get(material.categoryId) || {
        name: '',
        path: '',
      };
      const materialImages = imageMap.get(material.materialId) || [];

      return {
        ...material,
        categoryName: categoryInfo.name,
        categoryPath: categoryInfo.path,
        images: materialImages,
      };
    });

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(materialId: string, enhanced = false): Promise<any> {
    const material = await this.materialModel
      .findOne({ materialId, deletedAt: null })
      .lean();

    if (!material) {
      throw new HttpException('材料不存在', ERROR_CODES.MATERIAL_NOT_FOUND);
    }

    if (!enhanced) {
      return material;
    }

    // 获取分类信息
    const category = await this.categoryModel
      .findOne({ categoryId: material.categoryId })
      .select('name path')
      .lean();

    // 获取图片信息
    const images = await this.imageModel
      .find({ materialId })
      .select('url')
      .lean();

    // 获取统计数据
    const stats: MaterialStatsDto = {
      viewCount: material.stats?.viewCount || 0,
      editCount: material.stats?.editCount || 0,
      lastViewAt: material.stats?.lastViewAt || null,
      lastEditAt: material.stats?.lastEditAt || null,
    };

    return {
      ...material,
      categoryName: category?.name || '',
      categoryPath: category?.path || '',
      images: images.map((img) => img.url),
      stats,
    };
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
    const material = await this.materialModel.findOne({
      materialId,
      deletedAt: null,
    });
    if (!material) {
      throw new HttpException('材料不存在', ERROR_CODES.MATERIAL_NOT_FOUND);
    }

    // 检查库存状态，如果已上架则不允许删除
    const inventory = await this.inventoryService.findByMaterialId(materialId);
    if (inventory && inventory.status === 'on_shelf') {
      throw new HttpException(
        '该材料已上架，无法删除',
        ERROR_CODES.MATERIAL_IS_ON_SHELF,
      );
    }

    // 软删除
    await this.materialModel.updateOne(
      { materialId },
      { $set: { deletedAt: new Date() } },
    );

    // 软删除后，分类中的数量暂时不减
  }

  async toggleStatus(
    toggleStatusDto: ToggleStatusDto,
    userId: string,
  ): Promise<Material> {
    const { materialId, status } = toggleStatusDto;

    const material = await this.materialModel.findOne({
      materialId,
      deletedAt: null,
    });
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