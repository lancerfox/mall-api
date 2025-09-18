import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  BATCH_UPDATE = 'batch_update',
  BATCH_DELETE = 'batch_delete',
  TOGGLE_STATUS = 'toggle_status',
}

export enum TargetType {
  MATERIAL = 'material',
  CATEGORY = 'category',
  IMAGE = 'image',
  SEARCH_CONDITION = 'search_condition',
}

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
    enum: Object.values(OperationType),
    index: true,
  })
  operationType: OperationType;

  @Prop({
    required: true,
    enum: Object.values(TargetType),
    index: true,
  })
  targetType: TargetType;

  @Prop({ index: true })
  materialId?: string;

  @Prop({ maxlength: 500 })
  description: string;

  @Prop({ type: Object })
  beforeData?: Record<string, any>;

  @Prop({ type: Object })
  afterData?: Record<string, any>;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ default: Date.now, index: true })
  operationTime: Date;
}

export const OperationLogSchema = SchemaFactory.createForClass(OperationLog);

// 创建复合索引
OperationLogSchema.index({ userId: 1, operationTime: -1 });
OperationLogSchema.index({ materialId: 1, operationTime: -1 });
OperationLogSchema.index({ operationType: 1, operationTime: -1 });
