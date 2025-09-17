import { ApiProperty } from '@nestjs/swagger';

export class BatchUpdateResponseDto {
  @ApiProperty({ description: '成功更新数量', example: 2 })
  successCount: number;

  @ApiProperty({ description: '失败更新数量', example: 1 })
  failedCount: number;

  @ApiProperty({
    description: '成功更新的材料ID',
    example: ['M001', 'M002'],
    type: [String],
  })
  successIds: string[];

  @ApiProperty({
    description: '失败更新的材料列表',
    example: [{ materialId: 'M003', error: '材料不存在' }],
  })
  failedList: { materialId: string; error: string }[];
}

export class BatchMoveCategoryResponseDto {
  @ApiProperty({ description: '成功移动数量', example: 3 })
  successCount: number;

  @ApiProperty({ description: '失败移动数量', example: 0 })
  failedCount: number;

  @ApiProperty({
    description: '成功移动的材料ID',
    example: ['M001', 'M002', 'M003'],
    type: [String],
  })
  successIds: string[];

  @ApiProperty({
    description: '失败移动的材料列表',
    example: [],
  })
  failedList: { materialId: string; error: string }[];
}

export class BatchExportResponseDto {
  @ApiProperty({
    description: '导出文件URL',
    example: '/exports/materials_20240101_123456.xlsx',
  })
  fileUrl: string;

  @ApiProperty({
    description: '文件名',
    example: 'materials_20240101_123456.xlsx',
  })
  fileName: string;

  @ApiProperty({ description: '文件大小（字节）', example: 1024000 })
  fileSize: number;

  @ApiProperty({ description: '导出记录数', example: 100 })
  recordCount: number;
}

export class MaterialImportResponseDto {
  @ApiProperty({ description: '总记录数', example: 100 })
  totalCount: number;

  @ApiProperty({ description: '成功处理数量', example: 95 })
  successCount: number;

  @ApiProperty({ description: '失败处理数量', example: 5 })
  failedCount: number;

  @ApiProperty({ description: '创建记录数', example: 80 })
  createdCount: number;

  @ApiProperty({ description: '更新记录数', example: 15 })
  updatedCount: number;

  @ApiProperty({
    description: '失败处理的记录列表',
    example: [
      {
        row: 2,
        data: { name: '测试材料', price: 'abc' },
        errors: ['价格必须为数值'],
      },
    ],
  })
  failedList: {
    row: number;
    data: Record<string, any>;
    errors: string[];
  }[];
}
