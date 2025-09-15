import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class MoveCategoryDto {
  @ApiProperty({ description: '要移动的分类ID', example: 'C003' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: '目标父分类ID',
    example: 'C002',
    required: false,
  })
  @IsOptional()
  @IsString()
  targetParentId?: string;

  @ApiProperty({ description: '新的排序值', example: 2 })
  @IsNumber()
  @Min(0)
  sortOrder: number;
}
