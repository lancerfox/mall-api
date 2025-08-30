import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  PermissionType,
  ModuleType,
} from '../../../common/decorators/roles.decorator';

export class CreatePermissionDto {
  @ApiProperty({ description: 'The name of the permission' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The description of the permission' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The type of the permission',
    enum: PermissionType,
  })
  @IsEnum(PermissionType)
  @IsNotEmpty()
  type: PermissionType;

  @ApiProperty({
    description: 'The module of the permission',
    enum: ModuleType,
    required: false,
  })
  @IsEnum(ModuleType)
  @IsOptional()
  module?: ModuleType;

  @ApiProperty({
    description: 'The status of the permission',
    enum: ['active', 'inactive'],
    required: false,
  })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}
