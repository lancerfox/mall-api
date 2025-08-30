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
  @ApiProperty({ description: 'The name of the role' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The type of the role',
    enum: RoleType,
    enumName: 'RoleType',
  })
  @IsEnum(RoleType)
  @IsNotEmpty()
  type: RoleType;

  @ApiProperty({ description: 'The description of the role' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The permissions of the role',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  permissions?: string[];

  @ApiProperty({
    description: 'The status of the role',
    enum: ['active', 'inactive'],
    required: false,
  })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'Whether the role is a system role',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;
}
