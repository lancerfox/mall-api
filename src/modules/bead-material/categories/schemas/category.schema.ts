import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BeadCategoryDocument = BeadCategory & Document;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'bead_categories',
})
export class BeadCategory {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'BeadCategory',
    default: null,
  })
  parent_id: MongooseSchema.Types.ObjectId | null;

  @Prop({ trim: true, maxlength: 500 })
  description: string;

  @Prop({ default: 0, min: 0 })
  sort_order: number;

  @Prop({ default: 0, min: 0 })
  material_count: number;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  created_by: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  updated_by: MongooseSchema.Types.ObjectId;

  created_at: Date;
  updated_at: Date;
}

export const CategorySchema = SchemaFactory.createForClass(BeadCategory);

// 创建索引
CategorySchema.index({ parent_id: 1, sort_order: 1 });
CategorySchema.index({ name: 1 });
CategorySchema.index({ is_active: 1 });

// 添加虚拟字段
CategorySchema.virtual('children', {
  ref: 'BeadCategory',
  localField: '_id',
  foreignField: 'parent_id',
});
