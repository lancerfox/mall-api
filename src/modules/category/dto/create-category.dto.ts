import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Length,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: '分类名称', example: '水晶类' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 30)
  name: string;

  @ApiProperty({ description: '父分类ID', example: 'C001', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({
    description: '分类描述',
    example: '各种水晶材料',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  description?: string;

  @ApiProperty({ description: '排序值', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}
