import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from '../../permission/entities/permission.entity';
import { User } from '../../user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from '../../../common/enums/role-type.enum';

@Entity()
export class Role {
  @ApiProperty({ description: '角色ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '角色名称' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: '角色类型', enum: RoleType })
  @Column({ type: 'enum', enum: RoleType, default: RoleType.OPERATOR })
  type: RoleType;

  @ApiProperty({ description: '角色描述' })
  @Column()
  description: string;

  @ApiProperty({ description: '角色权限', type: () => [Permission] })
  @ManyToMany(() => Permission, { cascade: true, eager: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @ApiProperty({ description: '角色状态', enum: ['active', 'inactive'] })
  @Column({ default: 'active' })
  status: string;

  @ApiProperty({ description: '是否为系统角色' })
  @Column({ default: false })
  isSystem: boolean;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
