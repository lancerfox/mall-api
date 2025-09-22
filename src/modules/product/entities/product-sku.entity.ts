import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface Specification {
  key: string;
  value: string;
}

export type ProductSKUDocument = ProductSKU & Document;

@Schema({ timestamps: true })
export class ProductSKU {
  @Prop({ type: Types.ObjectId, ref: 'ProductSPU', required: true })
  spuId: Types.ObjectId;

  @Prop({ type: [{ key: String, value: String }], required: true })
  specifications: Specification[];

  @Prop()
  image: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ min: 0 })
  marketPrice: number;

  @Prop({ required: true, min: 0, default: 0 })
  stock: number;

  @Prop({ unique: true, sparse: true })
  skuCode: string;

  @Prop({ default: 1, enum: [0, 1] })
  status: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ProductSKUSchema = SchemaFactory.createForClass(ProductSKU);
