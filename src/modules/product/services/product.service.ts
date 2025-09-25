import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { ProductSPU, ProductSPUDocument } from '../entities/product-spu.entity';
import {
  ProductSKU,
  ProductSKUDocument,
  Specification,
} from '../entities/product-sku.entity';
import {
  ProductCategory,
  ProductCategoryDocument,
} from '../entities/product-category.entity';
import { SaveProductDto } from '../dto/save-product.dto';
import { ProductListDto } from '../dto/product-list.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { ProductDetailDto } from '../dto/product-detail.dto';
import {
  ProductResponseDto,
  ProductDetailResponseDto,
  SkuResponseDto,
} from '../dto/product-response.dto';
import { ProductEditResponseDto } from '../dto/product-edit-response.dto';
import { SpuDto } from '../dto/spu.dto';
import { SkuDto } from '../dto/sku.dto';
import { SpecificationDto } from '../dto/specification.dto';

interface SPUData {
  id?: string;
  name?: string;
  categoryId?: string;
  description?: string;
  mainImage?: string;
  images?: string[];
  video?: string;
  detail?: string;
  status?: string;
  createTime?: Date;
  updateTime?: Date;
  shelfTime?: Date;
  offShelfTime?: Date;
  deleteTime?: Date;
}

interface SKUData {
  id?: string;
  spuId?: string;
  skuCode?: string;
  price?: number;
  stock?: number;
  specifications?: Record<string, any>;
  createTime?: Date;
  updateTime?: Date;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(ProductSPU.name)
    private readonly spuModel: Model<ProductSPUDocument>,
    @InjectModel(ProductSKU.name)
    private readonly skuModel: Model<ProductSKUDocument>,
    @InjectModel(ProductCategory.name)
    private readonly categoryModel: Model<ProductCategoryDocument>,
  ) {}

  /**
   * 类型守卫函数，用于安全地检查分类文档对象
   * @param category 分类对象
   * @returns 如果是有效的分类文档则返回true
   */
  private isCategoryDocument(
    category: unknown,
  ): category is ProductCategoryDocument & { _id: Types.ObjectId } {
    return (
      category !== null &&
      typeof category === 'object' &&
      '_id' in category &&
      category._id instanceof Types.ObjectId &&
      'name' in category &&
      'code' in category
    );
  }

  /**
   * 保存商品（保存草稿或发布）
   */
  async saveProduct(
    saveProductDto: SaveProductDto,
  ): Promise<ProductResponseDto> {
    const { spu, skus, action } = saveProductDto;
    const now = new Date();

    let spuData: SPUData = {
      ...spu,
      updateTime: now,
      status: action === 'publish' ? 'On-shelf' : 'Draft',
    };

    if (spu.id) {
      // 更新现有SPU
      const existingSpu = await this.spuModel.findById(spu.id);
      if (!existingSpu) {
        throw new NotFoundException('商品不存在');
      }

      spuData = { ...existingSpu.toObject(), ...spuData } as SPUData;
    } else {
      // 创建新SPU
      spuData.createTime = now;
    }

    // 保存SPU
    const savedSpu = spu.id
      ? await this.spuModel.findByIdAndUpdate(
          spu.id,
          spuData as UpdateQuery<ProductSPU>,
          { new: true },
        )
      : await this.spuModel.create(spuData);

    if (!savedSpu) {
      throw new NotFoundException('保存商品失败');
    }

    // 保存SKUs
    await this.saveSKUs(String(savedSpu._id), skus);

    return await this.transformToResponseDto(savedSpu);
  }

  /**
   * 保存SKU列表
   */
  private async saveSKUs(spuId: string, skus: SKUData[]): Promise<void> {
    const now = new Date();

    // 获取当前数据库中该SPU的所有SKU
    const existingSkus = await this.skuModel.find({ spuId });
    const existingSkuIds = existingSkus.map((sku) => String(sku._id));

    // 分类处理提交的SKU数据
    const skusToUpdate: SKUData[] = [];
    const skusToCreate: SKUData[] = [];
    const submittedSkuIds: string[] = [];

    for (const sku of skus) {
      if (sku.id) {
        // 有ID的是更新操作
        skusToUpdate.push(sku);
        submittedSkuIds.push(sku.id);
      } else {
        // 没有ID的是新增操作
        skusToCreate.push(sku);
      }
    }

    // 找出需要删除的SKU（存在于数据库中但不在提交列表中）
    const skuIdsToDelete = existingSkuIds.filter(
      (id) => !submittedSkuIds.includes(id),
    );

    // 1. 删除不再需要的SKU
    if (skuIdsToDelete.length > 0) {
      await this.skuModel.deleteMany({ _id: { $in: skuIdsToDelete } });
    }

    // 2. 更新现有的SKU
    for (const sku of skusToUpdate) {
      if (!sku.id) continue;

      // 如果skuCode发生了变化，需要检查新的skuCode是否与其他SKU冲突
      if (sku.skuCode) {
        const existingSku = await this.skuModel.findById(sku.id);
        if (existingSku && existingSku.skuCode !== sku.skuCode) {
          // skuCode发生了变化，检查新的skuCode是否与其他SKU冲突
          const conflictingSku = await this.skuModel.findOne({
            skuCode: sku.skuCode,
            _id: { $ne: sku.id }, // 排除自己
          });
          if (conflictingSku) {
            throw new Error(
              `SKU编码 "${sku.skuCode}" 已被其他商品使用，请使用不同的编码`,
            );
          }
        }
      }

      await this.skuModel.findByIdAndUpdate(sku.id, {
        ...sku,
        spuId,
        updateTime: now,
      });
    }

    // 3. 创建新的SKU
    if (skusToCreate.length > 0) {
      // 检查新SKU的skuCode唯一性
      for (const sku of skusToCreate) {
        if (sku.skuCode) {
          const existingSku = await this.skuModel.findOne({
            skuCode: sku.skuCode,
          });
          if (existingSku) {
            throw new Error(
              `SKU编码 "${sku.skuCode}" 已被其他商品使用，请使用不同的编码`,
            );
          }
        }
      }

      const skuDocuments = skusToCreate.map((sku: SKUData) => ({
        ...sku,
        spuId,
        createTime: now,
        updateTime: now,
      }));

      await this.skuModel.insertMany(skuDocuments);
    }
  }

  /**
   * 获取商品列表（分页）
   */
  async getProductList(productListDto: ProductListDto): Promise<{
    items: ProductResponseDto[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, filters } = productListDto;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const query: Record<string, any> = {};
    if (filters) {
      if (filters.name) {
        query.name = { $regex: filters.name, $options: 'i' };
      }
      if (filters.id) {
        query._id = filters.id;
      }
      if (filters.categoryId) {
        query.categoryId = filters.categoryId;
      }
      if (filters.status) {
        query.status = filters.status;
      }
    }

    const [items, total] = await Promise.all([
      this.spuModel
        .find(query)
        .sort({ updateTime: -1 })
        .skip(skip)
        .limit(pageSize)
        .exec(),
      this.spuModel.countDocuments(query),
    ]);

    const responseItems = await Promise.all(
      items.map((item) => this.transformToResponseDto(item)),
    );

    return {
      items: responseItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取商品详情
   */
  async getProductDetail(
    productDetailDto: ProductDetailDto,
  ): Promise<ProductEditResponseDto> {
    const { id } = productDetailDto;

    const spu = await this.spuModel.findById(id);
    if (!spu) {
      throw new NotFoundException('商品不存在');
    }

    return this.transformToEditResponseDto(spu);
  }

  /**
   * 更新商品状态
   */
  async updateProductStatus(updateStatusDto: UpdateStatusDto): Promise<void> {
    const { ids, status } = updateStatusDto;

    const updateData: UpdateQuery<ProductSPU> = {
      status,
      updateTime: new Date(),
    };

    if (status === 'On-shelf') {
      updateData.shelfTime = new Date();
    } else if (status === 'Off-shelf') {
      updateData.offShelfTime = new Date();
    }

    const result = await this.spuModel.updateMany(
      { _id: { $in: ids } },
      updateData,
    );

    if (result.modifiedCount === 0) {
      throw new NotFoundException('未找到符合条件的商品');
    }
  }

  /**
   * 删除商品
   */
  async deleteProducts(ids: string[]): Promise<void> {
    const result = await this.spuModel.updateMany(
      { _id: { $in: ids } },
      {
        status: 'Deleted',
        updateTime: new Date(),
        deleteTime: new Date(),
      },
    );

    if (result.modifiedCount === 0) {
      throw new NotFoundException('未找到符合条件的商品');
    }
  }

  /**
   * 根据分类ID获取商品数量
   */
  async getProductCountByCategory(categoryId: string): Promise<number> {
    return await this.spuModel.countDocuments({
      categoryId,
      status: { $ne: 'Deleted' },
    });
  }

  /**
   * 检查SKU库存
   */
  async checkStock(skuId: string, quantity: number): Promise<boolean> {
    const sku = await this.skuModel.findById(skuId);
    return sku ? sku.stock >= quantity : false;
  }

  /**
   * 扣减SKU库存
   */
  async deductStock(skuId: string, quantity: number): Promise<void> {
    const result = await this.skuModel.findByIdAndUpdate(skuId, {
      $inc: { stock: -quantity },
      updateTime: new Date(),
    });

    if (!result) {
      throw new NotFoundException('SKU不存在');
    }
  }

  /**
   * 恢复SKU库存
   */
  async restoreStock(skuId: string, quantity: number): Promise<void> {
    const result = await this.skuModel.findByIdAndUpdate(skuId, {
      $inc: { stock: quantity },
      updateTime: new Date(),
    });

    if (!result) {
      throw new NotFoundException('SKU不存在');
    }
  }

  /**
   * 根据ID查找商品
   */
  async findById(id: string): Promise<ProductSPUDocument | null> {
    return this.spuModel.findById(id).exec();
  }

  /**
   * 转换SPU文档为响应DTO
   */
  private async transformToResponseDto(
    spu: ProductSPUDocument,
  ): Promise<ProductResponseDto> {
    const data = spu.toObject() as ProductSPU & {
      _id: Types.ObjectId;
    };

    // 1. 获取SKUs - 直接查询而不是使用虚拟字段
    const skus = await this.skuModel.find({ spuId: data._id.toString() });
    const skusData = skus.map((sku) => this.transformSkuToResponseDto(sku));

    // 2. 获取分类信息
    const populatedSpu = await spu.populate<{
      categoryId: ProductCategoryDocument;
    }>('categoryId');
    const category = populatedSpu.categoryId;

    // 2. 计算总库存和价格范围
    let totalStock = 0;
    const prices: number[] = [];
    skusData.forEach((sku) => {
      if (sku.enabled) {
        totalStock += sku.stock;
        if (sku.price > 0) prices.push(sku.price);
      }
    });
    const priceRange: [number, number] =
      prices.length > 0 ? [Math.min(...prices), Math.max(...prices)] : [0, 0];

    // 3. 获取分类
    const categoryDto =
      category && this.isCategoryDocument(category)
        ? {
            id: category._id.toString(),
            name: category.name,
            code: category.code,
            level: category.level,
            sort: category.sort,
            enabled: category.enabled,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
          }
        : {
            id: '',
            name: '',
            code: '',
            level: 1,
            sort: 0,
            enabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

    return {
      id: data._id?.toString() || '',
      spuCode: '', // SPU实体中没有spuCode字段，使用空字符串
      name: data.name || '',
      category: categoryDto,
      categoryName: category ? category.name : '',
      description: data.description || '',
      mainImage: data.mainImage || '',
      imageGallery: [], // SPU实体中没有images字段，使用空数组
      specifications: [], // SPU实体中没有specifications字段，使用空数组
      skus: skusData,
      status: data.status,
      totalStock,
      priceRange,
      material: data.material || '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  /**
   * 转换SKU文档为响应DTO
   */
  private transformSkuToResponseDto(sku: ProductSKUDocument): SkuResponseDto {
    const data = sku.toObject() as ProductSKU & { _id: Types.ObjectId };

    return {
      id: data._id?.toString() || '',
      skuCode: data.skuCode || '',
      price: data.price || 0,
      originalPrice: data.marketPrice || 0,
      stock: data.stock || 0,
      specs:
        data.specifications?.reduce(
          (acc: Record<string, string>, spec: Specification) => {
            acc[spec.key] = spec.value;
            return acc;
          },
          {},
        ) || {},
      enabled: data.status === 1,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  /**
   * 转换SPU文档为详情响应DTO
   */
  private async transformToDetailResponseDto(
    spu: ProductSPUDocument,
  ): Promise<ProductDetailResponseDto> {
    const baseDto = await this.transformToResponseDto(spu);

    return {
      ...baseDto,
      detailHtml: '', // SPU实体中没有detail字段，使用空字符串
      parameters: {}, // SPU实体中没有parameters字段，使用空对象
      afterSalesService: '', // SPU实体中没有afterSalesService字段，使用空字符串
      packageList: [], // SPU实体中没有packageList字段，使用空数组
    };
  }

  /**
   * 转换SPU文档为编辑响应DTO（与保存接口兼容）
   */
  private async transformToEditResponseDto(
    spu: ProductSPUDocument,
  ): Promise<ProductEditResponseDto> {
    const spuData = spu.toObject() as ProductSPU & { _id: Types.ObjectId };

    // 获取SKUs - 使用字符串类型的spuId进行查询
    const skus = await this.skuModel.find({ spuId: spuData._id.toString() });

    // 转换SPU数据
    const spuDto: SpuDto = {
      id: spuData._id?.toString(),
      name: spuData.name || '',
      subtitle: spuData.subtitle,
      categoryId: spuData.categoryId?.toString() || '',
      mainImage: spuData.mainImage,
      video: spuData.video,
      material: spuData.material || '',
      origin: spuData.origin,
      grade: spuData.grade,
      description: spuData.description,
      freight: spuData.freight,
      sort: spuData.sort,
    };

    // 转换SKU数据
    const skuDtos: SkuDto[] = skus.map((sku) => {
      const skuData = sku.toObject() as ProductSKU & { _id: Types.ObjectId };

      // 转换规格数据
      const specifications: SpecificationDto[] = (
        skuData.specifications || []
      ).map((spec) => ({
        key: spec.key,
        value: spec.value,
      }));

      return {
        id: skuData._id?.toString(),
        specifications,
        image: skuData.image,
        price: skuData.price || 0,
        marketPrice: skuData.marketPrice,
        stock: skuData.stock || 0,
        skuCode: skuData.skuCode,
        status: skuData.status,
      };
    });

    // 根据当前状态确定action
    const action = spuData.status === 'On-shelf' ? 'publish' : 'saveToDraft';

    return {
      spu: spuDto,
      skus: skuDtos,
      action,
    };
  }
}
