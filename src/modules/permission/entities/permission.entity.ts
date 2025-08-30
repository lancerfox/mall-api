import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  PermissionType,
  ModuleType,
} from '../../../common/decorators/roles.decorator';

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
    description: 'The type of the permission',
    enum: PermissionType,
    required: true,
  })
  @Prop({
    type: String,
    enum: PermissionType,
    default: PermissionType.API,
  })
  type: PermissionType;

  @ApiProperty({
    description: 'The module of the permission',
    enum: ModuleType,
    required: false,
  })
  @Prop({
    type: String,
    enum: ModuleType,
  })
  module?: ModuleType;

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
