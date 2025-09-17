import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Length,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ description: '分类ID', example: '60f1b2b3b3b3b3b3b3b3b3b3' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: '分类名称',
    example: '水晶类',
    required: true,
    minLength: 2,
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 30)
  name: string;

  @ApiProperty({
    description: '父分类ID',
    example: '60f1b2b3b3b3b3b3b3b3b3b3',
    required: false,
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({
    description: '分类描述',
    example: '各种水晶材料',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  description?: string;

  @ApiProperty({
    description: '排序值',
    example: 1,
    required: false,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}
