import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Role } from '../../role/entities/role.entity';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Role' }] })
  roles: Role[] | Types.ObjectId[];

  @Prop({
    type: String,
    enum: ['active', 'inactive', 'locked'],
    default: 'active',
  })
  status: string;

  @Prop()
  avatar?: string;

  @Prop()
  lastLoginTime?: Date;

  @Prop()
  lastLoginIp?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

/**
 * 用户密码加密中间件
 * 在保存用户数据前自动对密码进行哈希加密
 */
UserSchema.pre<UserDocument>('save', async function (next) {
  // 如果密码没有被修改，则跳过加密
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // 使用bcrypt对密码进行哈希加密，盐值为10
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error('密码加密失败'));
  }
});
