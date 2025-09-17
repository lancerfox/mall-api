import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class ToggleStatusDto {
  @ApiProperty({
    description: '材料ID',
    example: '60f1b2b3b3b3b3b3b3b3b3b3',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @ApiProperty({
    description: '目标状态',
    example: 'disabled',
    enum: ['enabled', 'disabled'],
    required: true,
  })
  @IsEnum(['enabled', 'disabled'])
  status: string;
}
