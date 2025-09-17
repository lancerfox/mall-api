import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MaterialImageDocument = MaterialImage & Document;

@Schema({
  collection: 'material_images',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class MaterialImage {
  @Prop({ required: true, unique: true, index: true })
  imageId: string;

  @Prop({ required: true, index: true })
  materialId: string;

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

export const MaterialImageSchema = SchemaFactory.createForClass(MaterialImage);

// 创建复合索引
MaterialImageSchema.index({ materialId: 1, sortOrder: 1 });
MaterialImageSchema.index({ materialId: 1, isMain: 1 });
MaterialImageSchema.index({ status: 1, createdAt: -1 });
