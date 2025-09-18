import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum BusinessType {
  MATERIAL = 'material',
  PRODUCT = 'product',
  USER = 'user',
  CATEGORY = 'category',
}

export class UploadImageDto {
  @ApiProperty({
    description: '业务ID（如材料ID、产品ID等）',
    example: '64b5f8e8f123456789abcdef',
  })
  @IsNotEmpty({ message: '业务ID不能为空' })
  @IsString()
  businessId: string;

  @ApiProperty({
    description: '业务类型',
    enum: BusinessType,
    example: BusinessType.MATERIAL,
  })
  @IsNotEmpty({ message: '业务类型不能为空' })
  @IsEnum(BusinessType, { message: '无效的业务类型' })
  businessType: BusinessType;

  @ApiProperty({
    description: '排序值',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  sortOrder?: number;

  @ApiProperty({
    description: '图片描述',
    example: '这是一张产品图片',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Alt文本',
    example: '红色玛瑙石',
    required: false,
  })
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiProperty({
    description: '图片文件',
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}

export class BatchUploadImagesDto {
  @ApiProperty({
    description: '业务ID（如材料ID、产品ID等）',
    example: '64b5f8e8f123456789abcdef',
  })
  @IsNotEmpty({ message: '业务ID不能为空' })
  @IsString()
  businessId: string;

  @ApiProperty({
    description: '业务类型',
    enum: BusinessType,
    example: BusinessType.MATERIAL,
  })
  @IsNotEmpty({ message: '业务类型不能为空' })
  @IsEnum(BusinessType, { message: '无效的业务类型' })
  businessType: BusinessType;

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
    description: '业务ID（如材料ID、产品ID等）',
    example: '64b5f8e8f123456789abcdef',
  })
  @IsNotEmpty({ message: '业务ID不能为空' })
  @IsString()
  businessId: string;

  @ApiProperty({
    description: '业务类型',
    enum: BusinessType,
    example: BusinessType.MATERIAL,
  })
  @IsNotEmpty({ message: '业务类型不能为空' })
  @IsEnum(BusinessType, { message: '无效的业务类型' })
  businessType: BusinessType;
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
    description: '业务ID（如材料ID、产品ID等）',
    example: '64b5f8e8f123456789abcdef',
  })
  @IsNotEmpty({ message: '业务ID不能为空' })
  @IsString()
  businessId: string;

  @ApiProperty({
    description: '业务类型',
    enum: BusinessType,
    example: BusinessType.MATERIAL,
  })
  @IsNotEmpty({ message: '业务类型不能为空' })
  @IsEnum(BusinessType, { message: '无效的业务类型' })
  businessType: BusinessType;

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
