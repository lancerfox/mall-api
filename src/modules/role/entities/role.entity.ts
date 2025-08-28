import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Permission } from '../../permission/entities/permission.entity';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }] })
  permissions: Permission[] | Types.ObjectId[];

  @Prop({
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  @Prop({ default: false })
  isSystem: boolean; // 标识是否为系统内置角色，系统角色不可删除
}

export const RoleSchema = SchemaFactory.createForClass(Role);
