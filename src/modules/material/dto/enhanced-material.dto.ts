import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';

export class MaterialDetailEnhancedDto {
  @ApiProperty({
    description: '材料ID',
    example: 'M001',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  materialId: string;
}

export class RelatedMaterialsDto {
  @ApiProperty({
    description: '材料ID',
    example: 'M001',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @ApiProperty({
    description: '推荐数量',
    example: 6,
    required: false,
    minimum: 1,
    maximum: 20,
    default: 6,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class CopyMaterialDto {
  @ApiProperty({
    description: '源材料ID',
    example: 'M001',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @ApiProperty({
    description: '新材料名称',
    example: '红玛瑙(副本)',
    required: false,
  })
  @IsOptional()
  @IsString()
  newName?: string;

  @ApiProperty({
    description: '是否复制图片',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  copyImages?: boolean;
}
