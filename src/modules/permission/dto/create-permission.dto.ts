import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    description: 'The module of the permission',
    required: false,
  })
  @IsString()
  @IsOptional()
  module?: string;

  @ApiProperty({
    description: 'The status of the permission',
    enum: ['active', 'inactive'],
    required: false,
  })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}
