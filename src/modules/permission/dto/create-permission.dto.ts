import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionType } from '../../../common/decorators/roles.decorator';

export class CreatePermissionDto {
  @ApiProperty({ description: '权限名称', example: 'user:create' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '权限描述', example: '创建用户' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: '权限类型',
    enum: PermissionType,
  })
  @IsEnum(PermissionType)
  @IsNotEmpty()
  type: PermissionType;

  @ApiProperty({
    description: '权限所属模块',
    required: false,
    example: 'user',
  })
  @IsString()
  @IsOptional()
  module?: string;

  @ApiProperty({
    description: '权限状态',
    enum: ['active', 'inactive'],
    required: false,
    example: 'active',
    default: 'active',
  })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}
