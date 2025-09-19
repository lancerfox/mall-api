import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type InventoryDocument = Inventory & Document;

export enum InventoryStatus {
  ON_SHELF = 'on_shelf',
  OFF_SHELF = 'off_shelf',
}

@Schema({
  collection: 'inventories',
  timestamps: true,
})
export class Inventory {
  @Prop({ required: true, unique: true, index: true })
  inventoryId: string;

  @Prop({ required: true, unique: true, index: true })
  materialId: string;

  @Prop({
    type: MongooseSchema.Types.Decimal128,
    required: true,
    default: Types.Decimal128.fromString('0.0'),
  })
  price: Types.Decimal128;

  @Prop({ required: true, min: 0, default: 0 })
  stock: number;

  @Prop({
    required: true,
    enum: Object.values(InventoryStatus),
    default: InventoryStatus.OFF_SHELF,
    index: true,
  })
  status: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
