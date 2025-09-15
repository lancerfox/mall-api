import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BeadMaterialDocument = BeadMaterial & Document;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'bead_materials',
})
export class BeadMaterial {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'BeadCategory',
    required: true,
  })
  category_id: MongooseSchema.Types.ObjectId;

  @Prop({ trim: true, maxlength: 50 })
  specification: string;

  @Prop({ trim: true, maxlength: 50 })
  color: string;

  @Prop({ trim: true, maxlength: 50 })
  size: string;

  @Prop({ trim: true, maxlength: 50 })
  unit: string;

  @Prop({ default: 0, min: 0 })
  stock_quantity: number;

  @Prop({ default: 0, min: 0 })
  min_stock: number;

  @Prop({ default: 0, min: 0 })
  max_stock: number;

  @Prop({ default: 0, min: 0 })
  purchase_price: number;

  @Prop({ default: 0, min: 0 })
  selling_price: number;

  @Prop({ trim: true, maxlength: 500 })
  description: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  created_by: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  updated_by: MongooseSchema.Types.ObjectId;

  created_at: Date;
  updated_at: Date;
}

export const MaterialSchema = SchemaFactory.createForClass(BeadMaterial);

// 创建索引
MaterialSchema.index({ category_id: 1, name: 1 });
MaterialSchema.index({ name: 1 });
MaterialSchema.index({ specification: 1 });
MaterialSchema.index({ is_active: 1 });
MaterialSchema.index({ stock_quantity: 1 });
