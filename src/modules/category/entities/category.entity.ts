import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({
  collection: 'categories',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class Category {
  @Prop({ required: true, unique: true, index: true })
  categoryId: string;

  @Prop({ required: true, index: true })
  name: string;

  @Prop({ index: true })
  parentId?: string;

  @Prop({ maxlength: 200 })
  description?: string;

  @Prop({ default: 0, min: 0 })
  sortOrder: number;

  @Prop({ required: true, min: 1 })
  level: number;

  @Prop({ required: true })
  path: string;

  @Prop({ default: 0, min: 0 })
  materialCount: number;

  @Prop({
    required: true,
    enum: ['enabled', 'disabled'],
    default: 'enabled',
  })
  status: string;

  @Prop({ index: true })
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  updatedBy: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// 创建复合索引
CategorySchema.index({ parentId: 1, sortOrder: 1 });
CategorySchema.index({ name: 1, parentId: 1 }, { unique: true });
CategorySchema.index({ path: 1 });
