import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MenuDocument = Menu & Document;

@Schema({ timestamps: true })
export class Menu {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  path?: string;

  @Prop()
  component?: string;

  @Prop()
  icon?: string;

  @Prop({ type: Types.ObjectId, ref: 'Menu' })
  parentId?: Types.ObjectId;

  @Prop({ default: 0 })
  sort: number;

  @Prop({ type: String, enum: ['menu', 'button', 'page'], default: 'menu' })
  type: string;

  @Prop({ type: String, enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop()
  permission?: string;

  @Prop({ default: false })
  hidden: boolean;

  @Prop({ default: true })
  keepAlive: boolean;

  @Prop()
  redirect?: string;

  @Prop({
    type: {
      title: { type: String, required: true },
      icon: { type: String },
      noCache: { type: Boolean, default: false },
      breadcrumb: { type: Boolean, default: true },
      affix: { type: Boolean, default: false },
    },
    _id: false,
  })
  meta?: {
    title: string;
    icon?: string;
    noCache?: boolean;
    breadcrumb?: boolean;
    affix?: boolean;
  };
}

export const MenuSchema = SchemaFactory.createForClass(Menu);

// 创建索引以优化查询性能
MenuSchema.index({ parentId: 1, sort: 1 });
MenuSchema.index({ status: 1 });
MenuSchema.index({ type: 1 });

// 添加虚拟字段用于填充子菜单
MenuSchema.virtual('children', {
  ref: 'Menu',
  localField: '_id',
  foreignField: 'parentId',
  options: { sort: { sort: 1 } },
});

// 确保在JSON序列化时包含虚拟字段
MenuSchema.set('toJSON', { virtuals: true });
MenuSchema.set('toObject', { virtuals: true });
