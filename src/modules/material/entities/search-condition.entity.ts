import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SearchConditionDocument = SearchCondition & Document;

@Schema({
  collection: 'search_conditions',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class SearchCondition {
  @Prop({ required: true, unique: true, index: true })
  conditionId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, maxlength: 50 })
  name: string;

  @Prop({ required: true, type: Object })
  conditions: Record<string, any>;

  @Prop({ required: true, default: false })
  isDefault: boolean;

  @Prop({ required: true, min: 0, default: 0 })
  useCount: number;

  @Prop()
  lastUsedAt?: Date;

  @Prop({ index: true })
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const SearchConditionSchema =
  SchemaFactory.createForClass(SearchCondition);

// 创建复合索引
SearchConditionSchema.index({ userId: 1, lastUsedAt: -1 });
SearchConditionSchema.index({ userId: 1, name: 1 }, { unique: true });
