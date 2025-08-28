import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  module?: string;

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}
