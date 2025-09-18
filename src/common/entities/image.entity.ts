import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImageDocument = Image & Document;

@Schema({
  collection: 'images',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class Image {
  @Prop({ required: true, unique: true, index: true })
  imageId: string;

  @Prop({ required: true, index: true })
  businessId: string; // 业务ID，可以是materialId, productId等

  @Prop({ required: true, index: true })
  businessType: string; // 业务类型，如 'material', 'product', 'user'等

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true, min: 0 })
  fileSize: number;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ min: 0 })
  width?: number;

  @Prop({ min: 0 })
  height?: number;

  @Prop({ required: true, min: 0, default: 0 })
  sortOrder: number;

  @Prop({ required: true, default: false })
  isMain: boolean;

  @Prop()
  thumbnailPath?: string;

  @Prop()
  mediumPath?: string;

  @Prop()
  description?: string; // 图片描述

  @Prop()
  alt?: string; // 图片alt文本

  @Prop({
    required: true,
    enum: ['active', 'deleted'],
    default: 'active',
    index: true,
  })
  status: string;

  @Prop({ index: true })
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ required: true })
  createdBy: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);

// 创建复合索引
ImageSchema.index({ businessId: 1, businessType: 1, sortOrder: 1 });
ImageSchema.index({ businessId: 1, businessType: 1, isMain: 1 });
ImageSchema.index({ businessType: 1, status: 1, createdAt: -1 });
