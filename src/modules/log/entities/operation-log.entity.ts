import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OperationLogDocument = OperationLog & Document;

@Schema({ timestamps: true })
export class OperationLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  module: string;

  @Prop()
  description?: string;

  @Prop()
  ip?: string;

  @Prop()
  userAgent?: string;

  @Prop({ type: Object })
  requestData?: any;

  @Prop({ type: Object })
  responseData?: any;

  @Prop({ type: String, enum: ['success', 'error'], default: 'success' })
  status: string;

  @Prop()
  errorMessage?: string;

  @Prop()
  executionTime?: number; // 执行时间（毫秒）

  @Prop()
  method?: string; // HTTP方法

  @Prop()
  url?: string; // 请求URL
}

export const OperationLogSchema = SchemaFactory.createForClass(OperationLog);

// 创建索引以优化查询性能
OperationLogSchema.index({ userId: 1, createdAt: -1 });
OperationLogSchema.index({ module: 1, createdAt: -1 });
OperationLogSchema.index({ action: 1, createdAt: -1 });
OperationLogSchema.index({ status: 1, createdAt: -1 });
OperationLogSchema.index({ createdAt: -1 }); // 按时间倒序查询
OperationLogSchema.index({ ip: 1 });
OperationLogSchema.index({ username: 1, createdAt: -1 });
