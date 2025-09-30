import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike, Not } from 'typeorm';
import { ProductSPU } from '../entities/product-spu.entity';
import { ProductSKU, Specification } from '../entities/product-sku.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { SaveProductDto } from '../dto/save-product.dto';
import { ProductListDto } from '../dto/product-list.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { ProductDetailDto } from '../dto/product-detail.dto';
import {
  ProductResponseDto,
  ProductDetailResponseDto,
  SkuResponseDto,
} from '../dto/product-response.dto';
import { ProductListPaginatedDto } from '../dto/product-list-response.dto';
import { ProductEditResponseDto } from '../dto/product-edit-response.dto';
import { SpuDto } from '../dto/spu.dto';
import { SkuDto } from '../dto/sku.dto';
import { SpecificationDto } from '../dto/specification.dto';
import { SupabaseService } from '../../image/services/supabase.service';
import { ImagePathUtil } from '../../../common/utils/image-path.util';

interface SKUData {
  id?: string;
  spuId?: string;
  skuCode?: string;
  price?: number;
  stock?: number;
  specifications?: Specification[];
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductSPU)
    private readonly spuRepository: Repository<ProductSPU>,
    @InjectRepository(ProductSKU)
    private readonly skuRepository: Repository<ProductSKU>,
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * 类型守卫函数，用于安全地检查分类对象
   * @param category 分类对象
   * @returns 如果是有效的分类对象则返回true
   */
  private isCategoryObject(
    category: unknown,
  ): category is ProductCategory & { id: string } {
    return (
      category !== null &&
      typeof category === 'object' &&
      'id' in category &&
      typeof (category as Record<string, unknown>).id === 'string' &&
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

    // 处理主图URL，只保留path部分
    if (spu.mainImage) {
      spu.mainImage = ImagePathUtil.extractImagePath(spu.mainImage);
    }

    let savedSpu: ProductSPU;

    if (spu.id) {
      // 更新现有SPU
      const existingSpu = await this.spuRepository.findOne({
        where: { id: spu.id },
      });
      if (!existingSpu) {
        throw new NotFoundException('商品不存在');
      }

      // 更新SPU
      Object.assign(existingSpu, {
        ...spu,
        updatedAt: now,
        status: action === 'publish' ? 'On-shelf' : 'Draft',
      });

      savedSpu = await this.spuRepository.save(existingSpu);
    } else {
      // 创建新SPU
      const newSpu = this.spuRepository.create({
        ...spu,
        createdAt: now,
        updatedAt: now,
        status: action === 'publish' ? 'On-shelf' : 'Draft',
      });

      savedSpu = await this.spuRepository.save(newSpu);
    }

    if (!savedSpu) {
      throw new NotFoundException('保存商品失败');
    }

    // 保存SKUs
    await this.saveSKUs(savedSpu.id, skus);

    return await this.transformToResponseDto(savedSpu);
  }

  /**
   * 保存SKU列表
   */
  private async saveSKUs(spuId: string, skus: SKUData[]): Promise<void> {
    const now = new Date();

    // 获取当前数据库中该SPU的所有SKU
    const existingSkus = await this.skuRepository.find({ where: { spuId } });
    const existingSkuIds = existingSkus.map((sku) => sku.id);

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
      await this.skuRepository.delete({ id: In(skuIdsToDelete) });
    }

    // 2. 更新现有的SKU
    for (const sku of skusToUpdate) {
      if (!sku.id) continue;

      // 如果skuCode发生了变化，需要检查新的skuCode是否与其他SKU冲突
      if (sku.skuCode) {
        const existingSku = await this.skuRepository.findOne({
          where: { id: sku.id },
        });
        if (existingSku && existingSku.skuCode !== sku.skuCode) {
          // skuCode发生了变化，检查新的skuCode是否与其他SKU冲突
          const conflictingSku = await this.skuRepository.findOne({
            where: { skuCode: sku.skuCode, id: Not(sku.id) }, // 排除自己
          });
          if (conflictingSku) {
            throw new Error(
              `SKU编码 "${sku.skuCode}" 已被其他商品使用，请使用不同的编码`,
            );
          }
        }
      }

      const existingSku = await this.skuRepository.findOne({
        where: { id: sku.id },
      });
      if (existingSku) {
        Object.assign(existingSku, {
          ...sku,
          spuId,
          updatedAt: now,
        });
        await this.skuRepository.save(existingSku);
      }
    }

    // 3. 创建新的SKU
    if (skusToCreate.length > 0) {
      // 检查新SKU的skuCode唯一性
      for (const sku of skusToCreate) {
        if (sku.skuCode) {
          const existingSku = await this.skuRepository.findOne({
            where: { skuCode: sku.skuCode },
          });
          if (existingSku) {
            throw new Error(
              `SKU编码 "${sku.skuCode}" 已被其他商品使用，请使用不同的编码`,
            );
          }
        }
      }

      const newSkus = skusToCreate.map((sku: SKUData) =>
        this.skuRepository.create({
          ...sku,
          spuId,
          createdAt: now,
          updatedAt: now,
        }),
      );

      await this.skuRepository.save(newSkus);
    }
  }

  /**
   * 获取商品列表（分页）
   */
  async getProductList(
    productListDto: ProductListDto,
  ): Promise<ProductListPaginatedDto> {
    const { page, pageSize, filters } = productListDto;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: {
      name?: any;
      id?: string;
      status?: string;
      categoryId?: string;
    } = {};
    if (filters) {
      if (filters.name) {
        where.name = ILike(`%${filters.name}%`);
      }
      if (filters.id) {
        where.id = filters.id;
      }
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }
    }

    const [list, total] = await this.spuRepository.findAndCount({
      where,
      order: { updatedAt: 'DESC' },
      skip,
      take: pageSize,
      relations: ['category'],
    });

    const responseItems = await Promise.all(
      list.map((item) => this.transformToResponseDto(item)),
    );

    return {
      list: responseItems,
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

    const spu = await this.spuRepository.findOne({ where: { id } });
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

    // 定义更新数据的类型
    const updateData: Partial<ProductSPU> = {
      status,
      updatedAt: new Date(),
    };

    const result = await this.spuRepository.update({ id: In(ids) }, updateData);

    if (result.affected === 0) {
      throw new NotFoundException('未找到符合条件的商品');
    }
  }

  /**
   * 删除商品
   */
  async deleteProducts(ids: string[]): Promise<void> {
    const result = await this.spuRepository.update(
      { id: In(ids) },
      {
        status: 'Deleted',
        updatedAt: new Date(),
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException('未找到符合条件的商品');
    }
  }

  /**
   * 根据分类ID获取商品数量
   */
  async getProductCountByCategory(categoryId: string): Promise<number> {
    return await this.spuRepository.count({
      where: {
        categoryId,
        status: Not('Deleted'),
      },
    });
  }

  /**
   * 根据ID查找商品
   */
  async findById(id: string): Promise<ProductSPU | null> {
    return this.spuRepository.findOne({ where: { id } });
  }

  /**
   * 转换SPU为响应DTO
   */
  private async transformToResponseDto(
    spu: ProductSPU,
  ): Promise<ProductResponseDto> {
    // 1. 获取SKUs
    const skus = await this.skuRepository.find({ where: { spuId: spu.id } });
    const skusData = skus.map((sku) => this.transformSkuToResponseDto(sku));

    // 2. 获取分类信息
    let category: ProductCategory | null = spu.category;
    if (!category && spu.categoryId) {
      category = await this.categoryRepository.findOne({
        where: { id: spu.categoryId },
      });
    }

    // 3. 计算总库存和价格范围
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

    // 4. 构建分类DTO
    const categoryDto = category
      ? {
          id: category.id,
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

    // 5. 处理主图URL，将路径拼接成完整URL
    let mainImageUrl = '';
    if (spu.mainImage) {
      mainImageUrl = ImagePathUtil.buildImageUrl(
        spu.mainImage,
        this.supabaseService,
      );
    }

    return {
      id: spu.id || '',
      spuCode: '', // SPU实体中没有spuCode字段，使用空字符串
      name: spu.name || '',
      category: categoryDto,
      categoryName: category ? category.name : '',
      description: spu.description || '',
      mainImage: mainImageUrl,
      imageGallery: [], // SPU实体中没有images字段，使用空数组
      specifications: [], // SPU实体中没有specifications字段，使用空数组
      skus: skusData,
      status: spu.status,
      totalStock,
      priceRange,
      material: spu.material || '',
      createdAt: spu.createdAt || new Date(),
      updatedAt: spu.updatedAt || new Date(),
    };
  }

  /**
   * 转换SKU为响应DTO
   */
  private transformSkuToResponseDto(sku: ProductSKU): SkuResponseDto {
    const specs: Record<string, string> = {};
    if (sku.specifications) {
      sku.specifications.forEach((spec) => {
        specs[spec.key] = spec.value;
      });
    }

    return {
      id: sku.id || '',
      skuCode: sku.skuCode || '',
      price: sku.price || 0,
      originalPrice: sku.marketPrice || 0,
      stock: sku.stock || 0,
      specs,
      enabled: sku.status === 1,
      createdAt: sku.createdAt || new Date(),
      updatedAt: sku.updatedAt || new Date(),
    };
  }

  /**
   * 转换SPU为详情响应DTO
   */
  private async transformToDetailResponseDto(
    spu: ProductSPU,
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
   * 转换SPU为编辑响应DTO（与保存接口兼容）
   */
  private async transformToEditResponseDto(
    spu: ProductSPU,
  ): Promise<ProductEditResponseDto> {
    // 获取SKUs
    const skus = await this.skuRepository.find({ where: { spuId: spu.id } });

    // 处理主图URL，将路径拼接成完整URL
    let mainImageUrl = '';
    if (spu.mainImage) {
      mainImageUrl = ImagePathUtil.buildImageUrl(
        spu.mainImage,
        this.supabaseService,
      );
    }

    // 转换SPU数据
    const spuDto: SpuDto = {
      id: spu.id || '',
      name: spu.name || '',
      subtitle: spu.subtitle || '',
      categoryId: spu.categoryId || '',
      mainImage: mainImageUrl,
      video: spu.video || '',
      material: spu.material || '',
      origin: spu.origin || '',
      grade: spu.grade || '',
      description: spu.description || '',
      freight: spu.freight ? Number(spu.freight) : 0,
      sort: spu.sort || 0,
    };

    // 转换SKU数据
    const skuDtos: SkuDto[] = skus.map((sku) => {
      // 转换规格数据
      const specifications: SpecificationDto[] = (sku.specifications || []).map(
        (spec) => ({
          key: spec.key,
          value: spec.value,
        }),
      );

      return {
        id: sku.id || '',
        specifications,
        image: sku.image || '',
        price: sku.price || 0,
        marketPrice: sku.marketPrice || 0,
        stock: sku.stock || 0,
        skuCode: sku.skuCode || '',
        status: sku.status || 1,
      };
    });

    // 根据当前状态确定action
    const action = spu.status === 'On-shelf' ? 'publish' : 'saveToDraft';

    return {
      spu: spuDto,
      skus: skuDtos,
      action,
    };
  }
}
