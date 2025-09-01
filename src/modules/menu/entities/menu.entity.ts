import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MenuDocument = Menu & Document;

@Schema({ timestamps: true })
export class Menu {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Menu', required: false })
  parentId?: Types.ObjectId;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  component?: string;

  @Prop({ required: false })
  redirect?: string;

  @Prop({ required: false })
  metaTitle?: string;

  @Prop({ required: false })
  metaIcon?: string;

  @Prop({ default: false })
  metaHidden: boolean;

  @Prop({ default: false })
  metaAlwaysShow: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);

// 创建索引优化查询性能
MenuSchema.index({ parentId: 1, status: 1 });
MenuSchema.index({ path: 1 }, { unique: true });
MenuSchema.index({ sortOrder: 1 });
