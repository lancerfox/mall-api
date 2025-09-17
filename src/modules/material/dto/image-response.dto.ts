import { ApiProperty } from '@nestjs/swagger';
import { MaterialImage } from '../entities/material-image.entity';

export class ImageResponseDto {
  @ApiProperty({ description: '图片ID', example: 'IMG001' })
  imageId: string;

  @ApiProperty({ description: '原始文件名', example: 'red_agate.jpg' })
  fileName: string;

  @ApiProperty({
    description: '文件存储路径',
    example: '/uploads/materials/M001/IMG001.jpg',
  })
  filePath: string;

  @ApiProperty({
    description: '缩略图路径',
    example: '/uploads/materials/M001/thumb_IMG001.jpg',
  })
  thumbnailPath?: string;

  @ApiProperty({
    description: '中等尺寸图路径',
    example: '/uploads/materials/M001/medium_IMG001.jpg',
  })
  mediumPath?: string;

  @ApiProperty({ description: '文件大小（字节）', example: 1024000 })
  fileSize: number;

  @ApiProperty({ description: '图片宽度', example: 800 })
  width?: number;

  @ApiProperty({ description: '图片高度', example: 600 })
  height?: number;

  @ApiProperty({ description: '排序值', example: 1 })
  sortOrder: number;

  @ApiProperty({ description: '是否为主图', example: false })
  isMain: boolean;

  @ApiProperty({
    description: '创建时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  constructor(image: MaterialImage) {
    this.imageId = image.imageId;
    this.fileName = image.fileName;
    this.filePath = image.filePath;
    this.thumbnailPath = image.thumbnailPath;
    this.mediumPath = image.mediumPath;
    this.fileSize = image.fileSize;
    this.width = image.width;
    this.height = image.height;
    this.sortOrder = image.sortOrder;
    this.isMain = image.isMain;
    this.createdAt = image.createdAt;
  }
}

export class UploadImageResponseDto {
  @ApiProperty({ description: '图片ID', example: 'IMG001' })
  imageId: string;

  @ApiProperty({ description: '原始文件名', example: 'red_agate.jpg' })
  fileName: string;

  @ApiProperty({
    description: '文件存储路径',
    example: '/uploads/materials/M001/IMG001.jpg',
  })
  filePath: string;

  @ApiProperty({
    description: '缩略图路径',
    example: '/uploads/materials/M001/thumb_IMG001.jpg',
  })
  thumbnailPath?: string;

  @ApiProperty({ description: '文件大小（字节）', example: 1024000 })
  fileSize: number;

  @ApiProperty({ description: '图片宽度', example: 800 })
  width?: number;

  @ApiProperty({ description: '图片高度', example: 600 })
  height?: number;

  @ApiProperty({ description: '排序值', example: 1 })
  sortOrder: number;

  @ApiProperty({ description: '是否为主图', example: false })
  isMain: boolean;
}

export class BatchUploadResponseDto {
  @ApiProperty({ description: '成功上传数量', example: 3 })
  successCount: number;

  @ApiProperty({ description: '失败上传数量', example: 1 })
  failedCount: number;

  @ApiProperty({
    description: '成功上传的图片列表',
    type: [UploadImageResponseDto],
  })
  successList: UploadImageResponseDto[];

  @ApiProperty({
    description: '失败上传的文件列表',
    example: [{ fileName: 'image4.jpg', error: '文件格式不支持' }],
  })
  failedList: { fileName: string; error: string }[];
}
