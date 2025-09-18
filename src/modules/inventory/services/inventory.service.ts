import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import {
  InventoryRecord,
  InventoryRecordDocument,
} from '../entities/inventory-record.entity';
import {
  InventoryOperation,
  InventoryOperationDocument,
} from '../entities/inventory-operation.entity';
import {
  Material,
  MaterialDocument,
} from '../../material/entities/material.entity';
import {
  Category,
  CategoryDocument,
} from '../../category/entities/category.entity';
import { InventoryListDto } from '../dto/inventory-list.dto';
import { InventoryAdjustDto } from '../dto/inventory-adjust.dto';
import { InventoryInboundDto } from '../dto/inventory-inbound.dto';
import { InventoryOutboundDto } from '../dto/inventory-outbound.dto';
import { OperationLogDto } from '../dto/operation-log.dto';
import {
  InventoryListResponseDto,
  InventoryOperationResponseDto,
  OperationLogResponseDto,
} from '../dto/inventory-response.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryRecord.name)
    private inventoryRecordModel: Model<InventoryRecordDocument>,
    @InjectModel(InventoryOperation.name)
    private inventoryOperationModel: Model<InventoryOperationDocument>,
    @InjectModel(Material.name)
    private materialModel: Model<MaterialDocument>,
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  async getInventoryList(
    query: InventoryListDto,
  ): Promise<InventoryListResponseDto> {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const [inventoryRecords, total] = await Promise.all([
      this.inventoryRecordModel.find().skip(skip).limit(pageSize).lean(),
      this.inventoryRecordModel.countDocuments(),
    ]);

    const recordMaterialIds = inventoryRecords.map((r) => r.materialId);
    const materials = await this.materialModel
      .find({ materialId: { $in: recordMaterialIds } })
      .lean();

    const materialMap = new Map(materials.map((m) => [m.materialId, m]));

    const list = inventoryRecords.map((record) => {
      const material = materialMap.get(record.materialId);
      return {
        materialId: record.materialId,
        materialName: material?.name || '',
        categoryId: material?.categoryId || '',
        categoryName: '',
        currentStock: record.currentStock,
        availableStock: record.availableStock,
        reservedStock: record.reservedStock,
        alertThreshold: record.alertThreshold,
        stockStatus: record.status,
        stockValue: record.stockValue,
        unitPrice: material?.price || 0,
        lastInboundAt: record.lastInboundAt,
        lastOutboundAt: record.lastOutboundAt,
        updatedAt: record.updatedAt,
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

  async adjustInventory(
    adjustDto: InventoryAdjustDto,
    userId: string,
  ): Promise<InventoryOperationResponseDto> {
    const { materialId, adjustType, quantity } = adjustDto;

    const material = await this.materialModel.findOne({ materialId });
    if (!material) {
      throw new HttpException('材料不存在', ERROR_CODES.MATERIAL_NOT_FOUND);
    }

    let inventoryRecord = await this.inventoryRecordModel.findOne({
      materialId,
    });

    if (!inventoryRecord) {
      const recordId = `IR${Date.now()}`;
      inventoryRecord = new this.inventoryRecordModel({
        recordId,
        materialId,
        currentStock: 0,
        availableStock: 0,
        reservedStock: 0,
        alertThreshold: 10,
        totalInbound: 0,
        totalOutbound: 0,
        stockValue: 0,
        status: 'out_of_stock',
        updatedBy: userId,
      });
      await inventoryRecord.save();
    }

    const beforeStock = inventoryRecord.currentStock;
    let afterStock = beforeStock;

    switch (adjustType) {
      case 'add':
        afterStock = beforeStock + quantity;
        break;
      case 'subtract':
        afterStock = Math.max(0, beforeStock - quantity);
        break;
      case 'set':
        afterStock = quantity;
        break;
    }

    const operationId = `OP${Date.now()}`;
    await this.inventoryRecordModel.updateOne(
      { materialId },
      { currentStock: afterStock, availableStock: afterStock },
    );

    return {
      operationId,
      beforeStock,
      afterStock,
      adjustQuantity: afterStock - beforeStock,
    };
  }

  async inboundInventory(
    inboundDto: InventoryInboundDto,
    userId: string,
  ): Promise<InventoryOperationResponseDto> {
    const { materialId, quantity } = inboundDto;

    const material = await this.materialModel.findOne({ materialId });
    if (!material) {
      throw new HttpException('材料不存在', ERROR_CODES.MATERIAL_NOT_FOUND);
    }

    let inventoryRecord = await this.inventoryRecordModel.findOne({
      materialId,
    });

    if (!inventoryRecord) {
      const recordId = `IR${Date.now()}`;
      inventoryRecord = new this.inventoryRecordModel({
        recordId,
        materialId,
        currentStock: 0,
        availableStock: 0,
        reservedStock: 0,
        alertThreshold: 10,
        totalInbound: 0,
        totalOutbound: 0,
        stockValue: 0,
        status: 'normal',
        updatedBy: userId,
      });
      await inventoryRecord.save();
    }

    const beforeStock = inventoryRecord.currentStock;
    const afterStock = beforeStock + quantity;
    const operationId = `OP${Date.now()}`;

    await this.inventoryRecordModel.updateOne(
      { materialId },
      { currentStock: afterStock, availableStock: afterStock },
    );

    return {
      operationId,
      beforeStock,
      afterStock,
      totalValue: quantity * material.price,
    };
  }

  async outboundInventory(
    outboundDto: InventoryOutboundDto,
    userId: string,
  ): Promise<InventoryOperationResponseDto> {
    const { materialId, quantity } = outboundDto;

    const material = await this.materialModel.findOne({ materialId });
    if (!material) {
      throw new HttpException('材料不存在', ERROR_CODES.MATERIAL_NOT_FOUND);
    }

    const inventoryRecord = await this.inventoryRecordModel.findOne({
      materialId,
    });

    if (!inventoryRecord) {
      throw new HttpException(
        '库存记录不存在',
        ERROR_CODES.INVENTORY_NOT_FOUND,
      );
    }

    if (inventoryRecord.currentStock < quantity) {
      throw new HttpException('库存不足', ERROR_CODES.INSUFFICIENT_STOCK);
    }

    const beforeStock = inventoryRecord.currentStock;
    const afterStock = beforeStock - quantity;
    const operationId = `OP${Date.now()}`;

    await this.inventoryRecordModel.updateOne(
      { materialId },
      { currentStock: afterStock, availableStock: afterStock },
    );

    return {
      operationId,
      beforeStock,
      afterStock,
      totalValue: quantity * material.price,
    };
  }

  async getOperationLog(
    query: OperationLogDto,
  ): Promise<OperationLogResponseDto> {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const [operations, total] = await Promise.all([
      this.inventoryOperationModel.find().skip(skip).limit(pageSize).lean(),
      this.inventoryOperationModel.countDocuments(),
    ]);

    const list = operations.map((operation) => ({
      operationId: operation.operationId,
      materialId: operation.materialId,
      materialName: '',
      operationType: operation.operationType,
      quantity: Math.abs(operation.quantity),
      beforeStock: operation.beforeStock,
      afterStock: operation.afterStock,
      unitPrice: operation.unitPrice,
      totalValue: operation.totalValue,
      reason: operation.reason,
      supplier: operation.supplier,
      customer: operation.customer,
      notes: operation.notes,
      operationDate: operation.operationDate,
      createdAt: operation.createdAt,
      createdBy: operation.createdBy,
    }));

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
