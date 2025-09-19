import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory, InventoryDocument } from '../entities/inventory.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,
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
}
