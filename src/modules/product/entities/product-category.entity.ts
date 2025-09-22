import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductCategoryDocument = ProductCategory & Document;

@Schema({ timestamps: true })
export class ProductCategory {
  @Prop({ type: Types.ObjectId, ref: 'ProductCategory', default: null })
  parentId: Types.ObjectId;

  @Prop({ required: true, maxlength: 50 })
  name: string;

  @Prop({ required: true, maxlength: 20 })
  code: string;

  @Prop({ required: true, default: 1, min: 1, max: 4 })
  level: number;

  @Prop({ maxlength: 255 })
  icon: string;

  @Prop({ maxlength: 500 })
  description: string;

  @Prop({ default: 0, min: 0, max: 9999 })
  sort: number;

  @Prop({ default: 1, enum: [0, 1] })
  status: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory);
