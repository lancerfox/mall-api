import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { ProductSPU } from '../entities/product-spu.entity';
import { ProductSKU } from '../entities/product-sku.entity';
import { SaveProductDto } from '../dto/save-product.dto';
import { ProductListDto } from '../dto/product-list.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { ProductDetailDto } from '../dto/product-detail.dto';

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
    private readonly spuModel: Model<ProductSPU>,
    @InjectModel(ProductSKU.name)
    private readonly skuModel: Model<ProductSKU>,
  ) {}

  /**
   * 保存商品（保存草稿或发布）
   */
  async saveProduct(saveProductDto: SaveProductDto): Promise<ProductSPU> {
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
    await this.saveSKUs(savedSpu._id.toString(), skus);

    return savedSpu;
  }

  /**
   * 保存SKU列表
   */
  private async saveSKUs(spuId: string, skus: SKUData[]): Promise<void> {
    // 删除旧的SKU
    await this.skuModel.deleteMany({ spuId });

    // 创建新的SKU
    const skuDocuments = skus.map((sku: SKUData) => ({
      ...sku,
      spuId,
      createTime: new Date(),
      updateTime: new Date(),
    }));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    await this.skuModel.insertMany(skuDocuments);
  }

  /**
   * 获取商品列表（分页）
   */
  async getProductList(productListDto: ProductListDto): Promise<{
    items: ProductSPU[];
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

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取商品详情
   */
  async getProductDetail(productDetailDto: ProductDetailDto): Promise<{
    spu: ProductSPU;
    skus: ProductSKU[];
  }> {
    const { id } = productDetailDto;

    const [spu, skus] = await Promise.all([
      this.spuModel.findById(id),
      this.skuModel.find({ spuId: id }),
    ]);

    if (!spu) {
      throw new NotFoundException('商品不存在');
    }

    return { spu, skus };
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
  async findById(id: string): Promise<ProductSPU | null> {
    return this.spuModel.findById(id).exec();
  }
}
