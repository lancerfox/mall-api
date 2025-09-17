import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class MoveCategoryDto {
  @ApiProperty({
    description: '要移动的分类ID',
    example: '60f1b2b3b3b3b3b3b3b3b3b3',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: '目标父分类ID, 如果不传或传null，则移动到根目录',
    example: '60f1b2b3b3b3b3b3b3b3b3b4',
    required: false,
  })
  @IsOptional()
  @IsString()
  targetParentId?: string;

  @ApiProperty({
    description: '新的排序值',
    example: 2,
    required: true,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  sortOrder: number;
}
