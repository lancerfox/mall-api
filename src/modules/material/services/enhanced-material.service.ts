import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, MaterialDocument } from '../entities/material.entity';
import {
  Category,
  CategoryDocument,
} from '../../category/entities/category.entity';
import {
  MaterialImage,
  MaterialImageDocument,
} from '../entities/material-image.entity';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import {
  MaterialDetailEnhancedDto,
  CopyMaterialDto,
} from '../dto/enhanced-material.dto';
import {
  MaterialDetailEnhancedResponseDto,
  CopyMaterialResponseDto,
  MaterialStatsDto,
} from '../dto/enhanced-material-response.dto';
import { ImageDataDto } from '../../upload/dto/upload-image-response.dto';

@Injectable()
export class EnhancedMaterialService {
  constructor(
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(MaterialImage.name)
    private imageModel: Model<MaterialImageDocument>,
  ) {}

  async getEnhancedMaterialDetail(
    detailDto: MaterialDetailEnhancedDto,
  ): Promise<MaterialDetailEnhancedResponseDto> {
    const material = await this.materialModel
      .findOne({ materialId: detailDto.materialId })
      .lean();

    if (!material) {
      throw new HttpException('材料不存在', ERROR_CODES.MATERIAL_NOT_FOUND);
    }

    // 获取分类信息和分类路径
    const category = await this.categoryModel
      .findOne({ categoryId: material.categoryId })
      .lean();

    const categoryName = category?.name || '';
    const categoryPath = await this.buildCategoryPath(material.categoryId);

    // 获取图片列表
    const images = await this.imageModel
      .find({ materialId: detailDto.materialId, status: 'active' })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    const imageList = images.map((image) => image as unknown as ImageDataDto);

    // 模拟统计信息（实际应从统计表获取）
    const stats: MaterialStatsDto = {
      viewCount: Math.floor(Math.random() * 500) + 50,
      editCount: Math.floor(Math.random() * 20) + 1,
      lastViewAt: new Date(),
      lastEditAt: material.updatedAt,
    };

    return {
      materialId: material.materialId,
      name: material.name,
      categoryId: material.categoryId,
      categoryName,
      categoryPath,
      price: material.price,
      stock: material.stock,
      description: material.description,
      color: material.color,
      hardness: material.hardness,
      density: material.density,
      status: material.status,
      images: imageList,
      stats,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
      createdBy: material.createdBy,
      updatedBy: material.updatedBy,
    };
  }



  async copyMaterial(
    copyDto: CopyMaterialDto,
    userId: string,
  ): Promise<CopyMaterialResponseDto> {
    const sourceMaterial = await this.materialModel
      .findOne({ materialId: copyDto.materialId })
      .lean();

    if (!sourceMaterial) {
      throw new HttpException('源材料不存在', ERROR_CODES.MATERIAL_NOT_FOUND);
    }

    // 生成新材料ID和名称
    const newMaterialId = `M${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 3)
      .toUpperCase()}`;

    const newName = copyDto.newName || `${sourceMaterial.name}(副本)`;

    // 检查新名称是否重复
    const existingMaterial = await this.materialModel.findOne({
      name: newName,
    });
    if (existingMaterial) {
      throw new HttpException(
        '材料名称已存在',
        ERROR_CODES.MATERIAL_ALREADY_EXISTS,
      );
    }

    // 创建新材料
    const newMaterial = new this.materialModel({
      ...sourceMaterial,
      materialId: newMaterialId,
      name: newName,
      createdBy: userId,
      updatedBy: userId,
    });

    await newMaterial.save();

    // 复制图片（如果需要）
    if (copyDto.copyImages !== false) {
      const sourceImages = await this.imageModel
        .find({ materialId: copyDto.materialId, status: 'active' })
        .lean();

      if (sourceImages.length > 0) {
        const newImages = sourceImages.map((image) => ({
          ...image,
          imageId: `IMG${Date.now()}${Math.random()
            .toString(36)
            .substr(2, 3)
            .toUpperCase()}`,
          materialId: newMaterialId,
          createdBy: userId,
        }));

        await this.imageModel.insertMany(newImages);
      }
    }

    // 更新分类材料数量
    await this.categoryModel.updateOne(
      { categoryId: sourceMaterial.categoryId },
      { $inc: { materialCount: 1 } },
    );

    return {
      materialId: newMaterialId,
      name: newName,
    };
  }

  private async buildCategoryPath(categoryId: string): Promise<string> {
    const category = await this.categoryModel.findOne({ categoryId }).lean();

    if (!category) {
      return '';
    }

    // 简化版本，实际可能需要递归构建完整路径
    return category.name;
  }
}
