import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type PermissionDocument = Permission & Document;

@Schema({ timestamps: true })
export class Permission {
  @ApiProperty({ description: 'The name of the permission' })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({ description: 'The description of the permission' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    description: 'The module of the permission',
    required: false,
  })
  @Prop()
  module?: string;

  @ApiProperty({
    description: 'The status of the permission',
    enum: ['active', 'inactive'],
  })
  @Prop({
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
