import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductCategoryDocument = ProductCategory & Document;

@Schema({ timestamps: true })
export class ProductCategory {
  @Prop({ type: Types.ObjectId, ref: 'ProductCategory', default: null })
  parentId: Types.ObjectId;

  @Prop({ required: true, maxlength: 50 })
  name: string;

  @Prop({ maxlength: 255 })
  icon: string;

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
