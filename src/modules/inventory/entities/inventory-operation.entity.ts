import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryOperationDocument = InventoryOperation & Document;

@Schema({
  collection: 'inventory_operations',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class InventoryOperation {
  @Prop({ required: true, unique: true, index: true })
  operationId: string;

  @Prop({ required: true, index: true })
  materialId: string;

  @Prop({
    required: true,
    enum: ['inbound', 'outbound', 'adjust'],
    index: true,
  })
  operationType: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true, min: 0 })
  beforeStock: number;

  @Prop({ required: true, min: 0 })
  afterStock: number;

  @Prop({ min: 0 })
  unitPrice?: number;

  @Prop({ min: 0 })
  totalValue?: number;

  @Prop({ required: true, maxlength: 100 })
  reason: string;

  @Prop({ maxlength: 100 })
  supplier?: string;

  @Prop({ maxlength: 100 })
  customer?: string;

  @Prop({ maxlength: 500 })
  notes?: string;

  @Prop({ required: true, index: true })
  operationDate: Date;

  @Prop({ index: true })
  batchId?: string;

  @Prop({
    required: true,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed',
    index: true,
  })
  status: string;

  @Prop({ index: true })
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ required: true, index: true })
  createdBy: string;

  @Prop()
  approvedBy?: string;

  @Prop()
  approvedAt?: Date;
}

export const InventoryOperationSchema =
  SchemaFactory.createForClass(InventoryOperation);

// 创建复合索引
InventoryOperationSchema.index({ materialId: 1, createdAt: -1 });
InventoryOperationSchema.index({ operationType: 1, operationDate: -1 });
InventoryOperationSchema.index({ createdBy: 1, createdAt: -1 });
InventoryOperationSchema.index({ batchId: 1 });
InventoryOperationSchema.index({ status: 1, operationDate: -1 });
