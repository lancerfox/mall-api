import { ApiProperty } from '@nestjs/swagger';

export class ImageDataDto {
  @ApiProperty({
    description: '图片ID',
    example: '64b5f8e8f123456789abcdef',
  })
  imageId: string;

  @ApiProperty({
    description: '业务ID',
    example: '64b5f8e8f123456789abcdef',
  })
  businessId: string;

  @ApiProperty({
    description: '业务类型',
    example: 'material',
  })
  businessType: string;

  @ApiProperty({
    description: '原始文件名',
    example: 'red_agate.jpg',
  })
  fileName: string;

  @ApiProperty({
    description: '文件路径',
    example: '/uploads/materials/20240101/IMG001.jpg',
  })
  filePath: string;

  @ApiProperty({
    description: '缩略图路径',
    example: '/uploads/materials/20240101/thumb_IMG001.jpg',
  })
  thumbnailPath?: string;

  @ApiProperty({
    description: '中等尺寸图路径',
    example: '/uploads/materials/20240101/medium_IMG001.jpg',
  })
  mediumPath?: string;

  @ApiProperty({
    description: '文件大小（字节）',
    example: 1024000,
  })
  fileSize: number;

  @ApiProperty({
    description: '图片宽度',
    example: 800,
  })
  width?: number;

  @ApiProperty({
    description: '图片高度',
    example: 600,
  })
  height?: number;

  @ApiProperty({
    description: '排序值',
    example: 1,
  })
  sortOrder: number;

  @ApiProperty({
    description: '是否为主图',
    example: false,
  })
  isMain: boolean;

  @ApiProperty({
    description: '图片描述',
    example: '这是一张产品图片',
  })
  description?: string;

  @ApiProperty({
    description: 'Alt文本',
    example: '红色玛瑙石',
  })
  alt?: string;

  @ApiProperty({
    description: '创建时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}

export class UploadImageResponseDto {
  @ApiProperty({
    description: '业务状态码',
    example: 200,
  })
  code: number;

  @ApiProperty({
    description: '响应消息',
    example: '上传成功',
  })
  message: string;

  @ApiProperty({
    description: '上传结果',
    type: ImageDataDto,
  })
  data: ImageDataDto | null;
}

export class UploadResultDto {
  @ApiProperty({
    description: '图片ID',
    example: '64b5f8e8f123456789abcdef',
  })
  imageId: string;

  @ApiProperty({
    description: '原始文件名',
    example: 'red_agate.jpg',
  })
  fileName: string;

  @ApiProperty({
    description: '文件路径',
    example: '/uploads/materials/20240101/IMG001.jpg',
  })
  filePath: string;
}

export class UploadErrorDto {
  @ApiProperty({
    description: '原始文件名',
    example: 'invalid_file.txt',
  })
  fileName: string;

  @ApiProperty({
    description: '错误信息',
    example: '文件格式不支持',
  })
  error: string;
}

export class BatchUploadDataDto {
  @ApiProperty({
    description: '成功上传数量',
    example: 3,
  })
  successCount: number;

  @ApiProperty({
    description: '失败数量',
    example: 1,
  })
  failedCount: number;

  @ApiProperty({
    description: '成功上传的文件列表',
    type: [UploadResultDto],
  })
  successList: UploadResultDto[];

  @ApiProperty({
    description: '失败的文件列表',
    type: [UploadErrorDto],
  })
  failedList: UploadErrorDto[];
}

export class BatchUploadResponseDto {
  @ApiProperty({
    description: '业务状态码',
    example: 200,
  })
  code: number;

  @ApiProperty({
    description: '响应消息',
    example: '批量上传完成',
  })
  message: string;

  @ApiProperty({
    description: '批量上传结果',
    type: BatchUploadDataDto,
  })
  data: BatchUploadDataDto;
}

export class ImageListResponseDto {
  @ApiProperty({
    description: '业务状态码',
    example: 200,
  })
  code: number;

  @ApiProperty({
    description: '响应消息',
    example: '获取成功',
  })
  message: string;

  @ApiProperty({
    description: '图片列表',
    type: [ImageDataDto],
  })
  data: ImageDataDto[];
}
