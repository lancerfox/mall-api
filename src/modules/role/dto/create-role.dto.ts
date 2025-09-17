import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from '../../../common/enums/role-type.enum';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: '管理员' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '角色类型',
    enum: RoleType,
    enumName: 'RoleType',
  })
  @IsEnum(RoleType)
  @IsNotEmpty()
  type: RoleType;

  @ApiProperty({ description: '角色描述', example: '拥有所有权限' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: '权限ID列表',
    type: [String],
    required: false,
    example: ['60f1b2b3b3b3b3b3b3b3b3b3'],
  })
  @IsArray()
  @IsOptional()
  permissions?: string[];

  @ApiProperty({
    description: '角色状态',
    enum: ['active', 'inactive'],
    required: false,
    example: 'active',
    default: 'active',
  })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: '是否为系统角色',
    required: false,
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;
}
