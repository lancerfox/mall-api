import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MaterialDocument = Material & Document;

@Schema({
  collection: 'materials',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class Material {
  @Prop({ required: true, unique: true, index: true })
  materialId: string;

  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true, index: true })
  categoryId: string;

  @Prop({ maxlength: 500 })
  description?: string;

  @Prop({ maxlength: 20 })
  color?: string;

  @Prop({ min: 1, max: 10 })
  hardness?: number;

  @Prop({ min: 0 })
  density?: number;

  @Prop({
    required: true,
    enum: ['enabled', 'disabled'],
    default: 'enabled',
    index: true,
  })
  status: string;

  @Prop({ index: true })
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  updatedBy: string;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);

// 创建复合索引
MaterialSchema.index({ name: 1, categoryId: 1 });
MaterialSchema.index({ status: 1, createdAt: -1 });
MaterialSchema.index({ deletedAt: 1 });
