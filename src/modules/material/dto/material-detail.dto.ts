import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class MaterialDetailDto {
  @ApiProperty({ description: '材料ID', example: 'M001' })
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @ApiProperty({
    description: '是否包含增强信息（分类路径、图片、统计信息等）',
    example: true,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  enhanced?: boolean;
}
