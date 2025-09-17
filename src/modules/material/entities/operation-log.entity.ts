import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OperationLogDocument = OperationLog & Document;

@Schema({
  collection: 'operation_logs',
  timestamps: { createdAt: 'createdAt' },
})
export class OperationLog {
  @Prop({ required: true, unique: true, index: true })
  logId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({
    required: true,
    enum: [
      'create',
      'update',
      'delete',
      'batch_update',
      'batch_delete',
      'toggle_status',
    ],
    index: true,
  })
  operation: string;

  @Prop({
    required: true,
    enum: ['material', 'category', 'image', 'search_condition'],
    index: true,
  })
  targetType: string;

  @Prop({ required: true, index: true })
  targetId: string;

  @Prop({ type: Object })
  oldData?: Record<string, any>;

  @Prop({ type: Object })
  newData?: Record<string, any>;

  @Prop({ maxlength: 200 })
  description?: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ index: true })
  createdAt: Date;
}

export const OperationLogSchema = SchemaFactory.createForClass(OperationLog);

// 创建复合索引
OperationLogSchema.index({ userId: 1, createdAt: -1 });
OperationLogSchema.index({ targetType: 1, targetId: 1 });
OperationLogSchema.index({ operation: 1, createdAt: -1 });
