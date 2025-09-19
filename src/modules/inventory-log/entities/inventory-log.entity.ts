import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryLogDocument = InventoryLog & Document;

export enum OperationType {
  UPDATE_STOCK = 'update_stock',
  UPDATE_PRICE = 'update_price',
}

@Schema({
  collection: 'inventory_logs',
  timestamps: { createdAt: true, updatedAt: false },
})
export class InventoryLog {
  @Prop({ required: true, unique: true, index: true })
  logId: string;

  @Prop({ required: true, index: true })
  operatorId: string;

  @Prop({ required: true })
  operatorName: string;

  @Prop({ required: true, index: true })
  materialId: string;

  @Prop({ required: true, index: true })
  materialName: string;

  @Prop({
    required: true,
    enum: Object.values(OperationType),
  })
  operationType: string;

  @Prop({ required: true })
  beforeValue: string;

  @Prop({ required: true })
  afterValue: string;

  @Prop()
  remark?: string;

  @Prop()
  createdAt: Date;
}

export const InventoryLogSchema = SchemaFactory.createForClass(InventoryLog);
