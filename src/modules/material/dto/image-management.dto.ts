import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadImageDto {
  @ApiProperty({
    description: '材料ID',
    example: '64b5f8e8f123456789abcdef',
  })
  @IsNotEmpty({ message: '材料ID不能为空' })
  @IsString()
  materialId: string;

  @ApiProperty({
    description: '排序值',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  sortOrder?: number;

  @ApiProperty({
    description: '图片文件',
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}

export class BatchUploadImagesDto {
  @ApiProperty({
    description: '材料ID',
    example: '64b5f8e8f123456789abcdef',
  })
  @IsNotEmpty({ message: '材料ID不能为空' })
  @IsString()
  materialId: string;

  @ApiProperty({
    description: '图片文件数组',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  files: Express.Multer.File[];
}

export class DeleteImageDto {
  @ApiProperty({
    description: '图片ID',
    example: '64b5f8e8f123456789abcdef',
  })
  @IsNotEmpty({ message: '图片ID不能为空' })
  @IsString()
  imageId: string;
}

export class GetImageListDto {
  @ApiProperty({
    description: '材料ID',
    example: '64b5f8e8f123456789abcdef',
  })
  @IsNotEmpty({ message: '材料ID不能为空' })
  @IsString()
  materialId: string;
}

export class SetMainImageDto {
  @ApiProperty({
    description: '图片ID',
    example: '64b5f8e8f123456789abcdef',
  })
  @IsNotEmpty({ message: '图片ID不能为空' })
  @IsString()
  imageId: string;
}

export class SortImagesDto {
  @ApiProperty({
    description: '材料ID',
    example: '64b5f8e8f123456789abcdef',
  })
  @IsNotEmpty({ message: '材料ID不能为空' })
  @IsString()
  materialId: string;

  @ApiProperty({
    description: '图片ID数组（按新顺序排列）',
    example: ['64b5f8e8f123456789abcdef', '64b5f8e8f123456789abcdeg'],
    type: [String],
  })
  @IsNotEmpty({ message: '图片ID数组不能为空' })
  @IsArray()
  @IsString({ each: true })
  imageIds: string[];
}
