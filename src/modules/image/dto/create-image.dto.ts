import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUrl,
  IsOptional,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateImageDto {
  @ApiProperty({
    description: '图片公网URL (Supabase)',
    example:
      'https://example.supabase.co/storage/v1/object/public/bucket/images/product-image-01.png',
  })
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @ApiProperty({
    description: '图片在Supabase中的路径',
    example: 'images/product-image-01.png',
  })
  @IsNotEmpty()
  @IsString()
  path: string;

  @ApiProperty({
    description: '图片文件名',
    example: 'product-image-01.png',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: '图片大小 (bytes)',
    example: 102400,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  size?: number;

  @ApiProperty({
    description: '图片MIME类型',
    example: 'image/png',
    required: false,
  })
  @IsOptional()
  @IsString()
  mimeType?: string;
}
