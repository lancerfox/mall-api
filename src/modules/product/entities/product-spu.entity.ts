import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductSPUDocument = ProductSPU & Document;

@Schema({ timestamps: true })
export class ProductSPU {
  @Prop({ required: true, maxlength: 200 })
  name: string;

  @Prop({ maxlength: 500 })
  subtitle: string;

  @Prop({ type: Types.ObjectId, ref: 'ProductCategory', required: true })
  categoryId: Types.ObjectId;

  @Prop()
  mainImage: string;

  @Prop()
  video: string;

  @Prop({ required: true, maxlength: 50 })
  material: string;

  @Prop({ maxlength: 50 })
  origin: string;

  @Prop({ maxlength: 50 })
  grade: string;

  @Prop({ maxlength: 2000 })
  description: string;

  @Prop({ default: 0, min: 0 })
  freight: number;

  @Prop({ default: 0, min: 0, max: 9999 })
  sort: number;

  @Prop({ default: 'Draft', enum: ['Draft', 'On-shelf', 'Off-shelf'] })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ProductSPUSchema = SchemaFactory.createForClass(ProductSPU);
