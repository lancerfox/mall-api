import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Permission } from '../../permission/entities/permission.entity';
import { ApiProperty } from '@nestjs/swagger';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @ApiProperty({ description: 'The name of the role' })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({ description: 'The description of the role' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    description: 'The permissions of the role',
    type: () => [Permission],
  })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }] })
  permissions: Permission[] | Types.ObjectId[];

  @ApiProperty({
    description: 'The status of the role',
    enum: ['active', 'inactive'],
  })
  @Prop({
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  @ApiProperty({ description: 'Whether the role is a system role' })
  @Prop({ default: false })
  isSystem: boolean; // 标识是否为系统内置角色，系统角色不可删除
}

export const RoleSchema = SchemaFactory.createForClass(Role);
