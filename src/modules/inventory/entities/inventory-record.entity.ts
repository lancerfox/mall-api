import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryRecordDocument = InventoryRecord & Document;

@Schema({
  collection: 'inventory_records',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class InventoryRecord {
  @Prop({ required: true, unique: true, index: true })
  recordId: string;

  @Prop({ required: true, index: true })
  materialId: string;

  @Prop({ required: true, min: 0, default: 0 })
  currentStock: number;

  @Prop({ required: true, min: 0, default: 0 })
  availableStock: number;

  @Prop({ required: true, min: 0, default: 0 })
  reservedStock: number;

  @Prop({ required: true, min: 0, default: 0 })
  alertThreshold: number;

  @Prop({ index: true })
  lastInboundAt?: Date;

  @Prop({ index: true })
  lastOutboundAt?: Date;

  @Prop({ required: true, min: 0, default: 0 })
  totalInbound: number;

  @Prop({ required: true, min: 0, default: 0 })
  totalOutbound: number;

  @Prop({ required: true, min: 0, default: 0 })
  stockValue: number;

  @Prop({
    required: true,
    enum: ['normal', 'warning', 'critical', 'out_of_stock'],
    default: 'normal',
    index: true,
  })
  status: string;

  @Prop({ index: true })
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ required: true })
  updatedBy: string;
}

export const InventoryRecordSchema =
  SchemaFactory.createForClass(InventoryRecord);

// 创建复合索引
InventoryRecordSchema.index({ materialId: 1 }, { unique: true });
InventoryRecordSchema.index({ status: 1, updatedAt: -1 });
InventoryRecordSchema.index({ currentStock: 1, alertThreshold: 1 });
