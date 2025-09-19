import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Length,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

export class UpdateMaterialDto {
  @ApiProperty({
    description: '材料ID',
    example: '60f1b2b3b3b3b3b3b3b3b3b3',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @ApiProperty({
    description: '材料名称',
    example: '红玛瑙',
    required: true,
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @ApiProperty({
    description: '分类ID',
    example: '60f1b2b3b3b3b3b3b3b3b3b3',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: '材料描述',
    example: '天然红玛瑙',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({
    description: '颜色',
    example: '红色',
    required: false,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  color?: string;

  @ApiProperty({
    description: '硬度(1-10)',
    example: 7,
    required: false,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  hardness?: number;

  @ApiProperty({
    description: '密度',
    example: 2.65,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  density?: number;

  @ApiProperty({
    description: '状态',
    example: 'enabled',
    enum: ['enabled', 'disabled'],
    required: true,
  })
  @IsEnum(['enabled', 'disabled'])
  status: string;
}
