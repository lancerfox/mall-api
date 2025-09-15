import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class ToggleStatusDto {
  @ApiProperty({ description: '材料ID', example: 'M001' })
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @ApiProperty({
    description: '目标状态',
    example: 'disabled',
    enum: ['enabled', 'disabled'],
  })
  @IsEnum(['enabled', 'disabled'])
  status: string;
}
