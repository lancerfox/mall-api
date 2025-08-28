import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsOptional()
  permissions?: string[];

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;
}
