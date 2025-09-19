import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InventoryLog,
  InventoryLogDocument,
} from '../entities/inventory-log.entity';

@Injectable()
export class InventoryLogService {
  constructor(
    @InjectModel(InventoryLog.name)
    private readonly inventoryLogModel: Model<InventoryLogDocument>,
  ) {}
}
