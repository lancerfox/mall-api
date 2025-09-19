import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InventoryLog,
  InventoryLogDocument,
  OperationType,
} from '../entities/inventory-log.entity';
import { v4 as uuidv4 } from 'uuid';
import { InventoryLogListDto } from '../dto/inventory-log-list.dto';

interface CreateLogDto {
  operatorId: string;
  operatorName: string;
  materialId: string;
  materialName: string;
  operationType: OperationType;
  beforeValue: any;
  afterValue: any;
  remark?: string;
}

@Injectable()
export class InventoryLogService {
  constructor(
    @InjectModel(InventoryLog.name)
    private readonly inventoryLogModel: Model<InventoryLogDocument>,
  ) {}

  async createLog(dto: CreateLogDto): Promise<InventoryLog> {
    const newLog = new this.inventoryLogModel({
      ...dto,
      logId: uuidv4(),
      beforeValue: JSON.stringify(dto.beforeValue),
      afterValue: JSON.stringify(dto.afterValue),
    });
    return newLog.save();
  }

  async findAll(query: InventoryLogListDto) {
    const { page, pageSize, operatorName, materialName, startDate, endDate } =
      query;
    const skip = (page - 1) * pageSize;

    const filter: any = {};

    if (operatorName) {
      filter.operatorName = { $regex: operatorName, $options: 'i' };
    }

    if (materialName) {
      filter.materialName = { $regex: materialName, $options: 'i' };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(
          new Date(endDate).setHours(23, 59, 59, 999),
        );
      }
    }

    const [list, total] = await Promise.all([
      this.inventoryLogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      this.inventoryLogModel.countDocuments(filter),
    ]);

    const formattedList = list.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    }));

    return {
      list: formattedList,
      total,
    };
  }
}
