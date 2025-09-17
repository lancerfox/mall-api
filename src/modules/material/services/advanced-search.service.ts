import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, MaterialDocument } from '../entities/material.entity';
import {
  Category,
  CategoryDocument,
} from '../../category/entities/category.entity';
import {
  SearchCondition,
  SearchConditionDocument,
} from '../entities/search-condition.entity';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import {
  AdvancedSearchDto,
  SaveSearchConditionDto,
  DeleteSearchConditionDto,
} from '../dto/advanced-search.dto';
import {
  AdvancedSearchResponseDto,
  SearchConditionResponseDto,
  SaveSearchConditionResponseDto,
} from '../dto/advanced-search-response.dto';

@Injectable()
export class AdvancedSearchService {
  constructor(
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(SearchCondition.name)
    private searchConditionModel: Model<SearchConditionDocument>,
  ) {}

  async advancedSearch(
    searchDto: AdvancedSearchDto,
  ): Promise<AdvancedSearchResponseDto> {
    const startTime = Date.now();
    const {
      page,
      pageSize,
      conditions,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = searchDto;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const filter = this.buildSearchFilter(conditions);

    // 构建排序条件
    const sortCondition: Record<string, 1 | -1> = {};
    sortCondition[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // 执行查询
    const [materials, total] = await Promise.all([
      this.materialModel
        .find(filter)
        .sort(sortCondition)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      this.materialModel.countDocuments(filter),
    ]);

    // 获取分类信息
    const categoryIds = [...new Set(materials.map((m) => m.categoryId))];
    const categories = await this.categoryModel
      .find({ categoryId: { $in: categoryIds } })
      .lean();

    const categoryMap = new Map(categories.map((c) => [c.categoryId, c.name]));

    // 组装结果
    const list = materials.map((material) => ({
      materialId: material.materialId,
      name: material.name,
      categoryId: material.categoryId,
      categoryName: categoryMap.get(material.categoryId) || '',
      price: material.price,
      stock: material.stock,
      color: material.color,
      hardness: material.hardness,
      density: material.density,
      status: material.status,
      mainImage: '', // TODO: 从图片表获取主图
      createdAt: material.createdAt,
    }));

    const searchTime = Date.now() - startTime;

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      searchTime,
    };
  }

  async saveSearchCondition(
    saveDto: SaveSearchConditionDto,
    userId: string,
  ): Promise<SaveSearchConditionResponseDto> {
    // 检查名称是否重复
    const existingCondition = await this.searchConditionModel.findOne({
      userId,
      name: saveDto.name,
    });

    if (existingCondition) {
      throw new HttpException(
        '搜索条件名称已存在',
        ERROR_CODES.VALIDATION_FAILED,
      );
    }

    // 如果设为默认，先取消其他默认条件
    if (saveDto.isDefault) {
      await this.searchConditionModel.updateMany(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    const conditionId = `SC${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 3)
      .toUpperCase()}`;

    const searchCondition = new this.searchConditionModel({
      conditionId,
      userId,
      name: saveDto.name,
      conditions: saveDto.conditions,
      isDefault: saveDto.isDefault || false,
      useCount: 0,
    });

    await searchCondition.save();

    return { conditionId };
  }

  async getSearchConditions(
    userId: string,
  ): Promise<SearchConditionResponseDto[]> {
    const conditions = await this.searchConditionModel
      .find({ userId })
      .sort({ lastUsedAt: -1, createdAt: -1 })
      .lean();

    return conditions.map(
      (condition) => new SearchConditionResponseDto(condition),
    );
  }

  async deleteSearchCondition(
    deleteDto: DeleteSearchConditionDto,
    userId: string,
  ): Promise<void> {
    const condition = await this.searchConditionModel.findOne({
      conditionId: deleteDto.conditionId,
      userId,
    });

    if (!condition) {
      throw new HttpException('搜索条件不存在', ERROR_CODES.VALIDATION_FAILED);
    }

    await this.searchConditionModel.deleteOne({
      conditionId: deleteDto.conditionId,
    });
  }

  async updateSearchConditionUsage(
    conditionId: string,
    userId: string,
  ): Promise<void> {
    await this.searchConditionModel.updateOne(
      { conditionId, userId },
      {
        $inc: { useCount: 1 },
        lastUsedAt: new Date(),
      },
    );
  }

  private buildSearchFilter(conditions: any): Record<string, any> {
    const filter: Record<string, any> = {};

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (conditions.name) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      filter.name = { $regex: conditions.name, $options: 'i' };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (conditions.categoryIds && conditions.categoryIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      filter.categoryId = { $in: conditions.categoryIds };
    }

    // 价格范围

    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      conditions.priceMin !== undefined ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      conditions.priceMax !== undefined
    ) {
      filter.price = {};
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (conditions.priceMin !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        filter.price.$gte = conditions.priceMin;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (conditions.priceMax !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        filter.price.$lte = conditions.priceMax;
      }
    }

    return filter;
  }
}
