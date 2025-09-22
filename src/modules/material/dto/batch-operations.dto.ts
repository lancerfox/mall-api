import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PriceAdjustmentDto {
  @ApiProperty({
    description: '调整类型',
    enum: ['multiply', 'add', 'set'],
    example: 'multiply',
  })
  @IsEnum(['multiply', 'add', 'set'])
  type: string;

  @ApiProperty({
    description: '调整值',
    example: 1.1,
  })
  @IsNumber()
  value: number;
}

export class StockAdjustmentDto {
  @ApiProperty({
    description: '调整类型',
    enum: ['add', 'subtract', 'set'],
    example: 'add',
  })
  @IsEnum(['add', 'subtract', 'set'])
  type: string;

  @ApiProperty({
    description: '调整值',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  value: number;
}

export class BatchMoveCategoryDto {
  @ApiProperty({
    description: '材料ID数组',
    example: ['M001', 'M002', 'M003'],
    type: [String],
    required: true,
    minItems: 1,
    maxItems: 1000,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  materialIds: string[];

  @ApiProperty({
    description: '目标分类ID',
    example: 'C002',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  targetCategoryId: string;
}

export class BatchUpdateDataDto {
  @ApiProperty({
    description: '新分类ID',
    example: 'C002',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: '价格调整',
    type: PriceAdjustmentDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PriceAdjustmentDto)
  price?: PriceAdjustmentDto;

  @ApiProperty({
    description: '库存调整',
    type: StockAdjustmentDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => StockAdjustmentDto)
  stock?: StockAdjustmentDto;

  @ApiProperty({
    description: '新状态',
    enum: ['enabled', 'disabled'],
    example: 'enabled',
    required: false,
  })
  @IsOptional()
  @IsEnum(['enabled', 'disabled'])
  status?: string;
}

export class BatchUpdateMaterialDto {
  @ApiProperty({
    description: '材料ID数组',
    example: ['M001', 'M002', 'M003'],
    type: [String],
    required: true,
    minItems: 1,
    maxItems: 1000,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  materialIds: string[];

  @ApiProperty({
    description: '要更新的数据',
    type: BatchUpdateDataDto,
    required: true,
  })
  @ValidateNested()
  @Type(() => BatchUpdateDataDto)
  updateData: BatchUpdateDataDto;
}
