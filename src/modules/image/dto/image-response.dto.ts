import { ApiProperty } from '@nestjs/swagger';

export class ImageResponseDto {
  @ApiProperty({
    description: '图片ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '图片公网URL',
    example:
      'https://example.supabase.co/storage/v1/object/public/bucket/images/product-image-01.png',
  })
  url: string;

  @ApiProperty({
    description: '图片文件名',
    example: 'product-image-01.png',
  })
  name: string;

  @ApiProperty({
    description: '图片大小 (bytes)',
    example: 102400,
    required: false,
  })
  size?: number;

  @ApiProperty({
    description: '创建时间',
    example: '2023-10-27T10:00:00Z',
  })
  createdAt: Date;
}

export class UploadTokenResponseDto {
  @ApiProperty({
    description: '预签名上传URL',
    example:
      'https://example.supabase.co/storage/v1/object/upload/bucket/images/product-image-01.png?token=...',
  })
  signedUrl: string;

  @ApiProperty({
    description: '图片在Supabase中的路径',
    example: 'images/product-image-01.png',
  })
  path: string;
}

export class CreateImageResponseDto {
  @ApiProperty({
    description: '图片ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '图片公网URL',
    example:
      'https://example.supabase.co/storage/v1/object/public/bucket/images/product-image-01.png',
  })
  url: string;

  @ApiProperty({
    description: '创建时间',
    example: '2023-10-27T10:00:00Z',
  })
  createdAt: Date;
}
