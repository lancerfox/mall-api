import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Inventory,
  InventoryDocument,
  InventoryStatus,
} from '../entities/inventory.entity';
import { v4 as uuidv4 } from 'uuid';
import { InventoryListDto } from '../dto/inventory-list.dto';
import {
  Material,
  MaterialDocument,
} from '../../material/entities/material.entity';
import {
  Category,
  CategoryDocument,
} from '../../category/entities/category.entity';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { InventoryLogService } from '../../inventory-log/services/inventory-log.service';
import { OperationType } from '../../inventory-log/entities/inventory-log.entity';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { User, UserDocument } from '../../user/entities/user.entity';

interface InventoryUser {
  id: string;
  username: string;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly inventoryLogService: InventoryLogService,
  ) {}

  async create(materialId: string): Promise<Inventory> {
    const newInventory = new this.inventoryModel({
      inventoryId: uuidv4(),
      materialId,
    });
    return newInventory.save();
  }

  async findByMaterialId(materialId: string): Promise<Inventory | null> {
    return this.inventoryModel.findOne({ materialId }).exec();
  }

  async findAll(query: InventoryListDto) {
    const { page, pageSize, keyword, categoryId, status } = query;
    const skip = (page - 1) * pageSize;

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'materials',
          localField: 'materialId',
          foreignField: 'materialId',
          as: 'material',
        },
      },
      { $unwind: '$material' },
      {
        $lookup: {
          from: 'categories',
          localField: 'material.categoryId',
          foreignField: 'categoryId',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $match: {
          'material.deletedAt': null,
        },
      },
    ];

    if (keyword) {
      pipeline.push({
        $match: { 'material.name': { $regex: keyword, $options: 'i' } },
      });
    }

    if (categoryId) {
      pipeline.push({ $match: { 'material.categoryId': categoryId } });
    }

    if (status) {
      pipeline.push({ $match: { status } });
    }

    const [list, total] = await Promise.all([
      this.inventoryModel.aggregate(pipeline).skip(skip).limit(pageSize),
      this.inventoryModel.aggregate([...pipeline, { $count: 'total' }]),
    ]);

    const formattedList = list.map((item) => ({
      inventoryId: item.inventoryId,
      materialId: item.materialId,
      materialName: item.material.name,
      categoryName: item.category.name,
      price: parseFloat(item.price.toString()),
      stock: item.stock,
      status: item.status,
    }));

    return {
      list: formattedList,
      total: total[0]?.total || 0,
    };
  }

  async update(dto: UpdateInventoryDto, user: InventoryUser) {
    const { inventoryId, price, stock } = dto;

    const inventory = await this.inventoryModel.findOne({ inventoryId });
    if (!inventory) {
      throw new HttpException(
        '库存记录不存在',
        ERROR_CODES.INVENTORY_NOT_FOUND,
      );
    }

    const material = await this.materialModel.findOne({
      materialId: inventory.materialId,
    });
    if (!material) {
      throw new HttpException(
        '关联的素材不存在',
        ERROR_CODES.MATERIAL_NOT_FOUND,
      );
    }

    const updateFields: any = {};

    if (price !== undefined) {
      const oldPrice = parseFloat(inventory.price.toString());
      if (oldPrice !== price) {
        updateFields.price = Types.Decimal128.fromString(price.toString());
        await this.inventoryLogService.createLog({
          operatorId: user.id,
          operatorName: user.username,
          materialId: material.materialId,
          materialName: material.name,
          operationType: OperationType.UPDATE_PRICE,
          beforeValue: oldPrice,
          afterValue: price,
        });
      }
    }

    if (stock !== undefined) {
      if (inventory.stock !== stock) {
        updateFields.stock = stock;
        await this.inventoryLogService.createLog({
          operatorId: user.id,
          operatorName: user.username,
          materialId: material.materialId,
          materialName: material.name,
          operationType: OperationType.UPDATE_STOCK,
          beforeValue: inventory.stock,
          afterValue: stock,
        });
      }
    }

    if (Object.keys(updateFields).length > 0) {
      await this.inventoryModel.updateOne(
        { inventoryId },
        { $set: updateFields },
      );
    }

    return null;
  }

  async shelve(inventoryIds: string[]) {
    await this.inventoryModel.updateMany(
      { inventoryId: { $in: inventoryIds } },
      { $set: { status: InventoryStatus.ON_SHELF } },
    );
    return null;
  }

  async unshelve(inventoryIds: string[]) {
    await this.inventoryModel.updateMany(
      { inventoryId: { $in: inventoryIds } },
      { $set: { status: InventoryStatus.OFF_SHELF } },
    );
    return null;
  }
}
