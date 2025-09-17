import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class UploadImageDto {
  @ApiProperty({
    description: '材料ID',
    example: 'M001',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @ApiProperty({
    description: '排序值',
    example: 1,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

export class BatchUploadImageDto {
  @ApiProperty({
    description: '材料ID',
    example: 'M001',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  materialId: string;
}

export class DeleteImageDto {
  @ApiProperty({
    description: '图片ID',
    example: 'IMG001',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  imageId: string;
}

export class GetImageListDto {
  @ApiProperty({
    description: '材料ID',
    example: 'M001',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  materialId: string;
}

export class SetMainImageDto {
  @ApiProperty({
    description: '图片ID',
    example: 'IMG001',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  imageId: string;
}

export class SortImagesDto {
  @ApiProperty({
    description: '材料ID',
    example: 'M001',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @ApiProperty({
    description: '图片ID数组，按新顺序排列',
    example: ['IMG001', 'IMG002', 'IMG003'],
    type: [String],
    required: true,
  })
  @IsString({ each: true })
  imageIds: string[];
}
