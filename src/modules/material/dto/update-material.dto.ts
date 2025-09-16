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
  @ApiProperty({ description: '材料ID', example: 'M001' })
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @ApiProperty({ description: '材料名称', example: '红玛瑙' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @ApiProperty({ description: '分类ID', example: 'C001' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: '价格', example: 15.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ description: '库存数量', example: 100 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    description: '材料描述',
    example: '天然红玛瑙',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ description: '颜色', example: '红色', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  color?: string;

  @ApiProperty({ description: '硬度(1-10)', example: 7, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  hardness?: number;

  @ApiProperty({ description: '密度', example: 2.65, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  density?: number;

  @ApiProperty({
    description: '状态',
    example: 'enabled',
    enum: ['enabled', 'disabled'],
  })
  @IsEnum(['enabled', 'disabled'])
  status: string;
}
