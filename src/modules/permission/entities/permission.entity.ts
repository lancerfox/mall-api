import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionType } from '../../../common/decorators/roles.decorator';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '权限名称' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: '权限描述' })
  @Column()
  description: string;

  @ApiProperty({ description: '权限类型', enum: PermissionType })
  @Column({
    type: 'enum',
    enum: PermissionType,
    default: PermissionType.API,
  })
  type: PermissionType;

  @ApiProperty({ description: '权限所属模块', required: false })
  @Column({ nullable: true })
  module?: string;

  @ApiProperty({ description: '权限状态', enum: ['active', 'inactive'] })
  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
