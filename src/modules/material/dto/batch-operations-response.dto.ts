import { ApiProperty } from '@nestjs/swagger';

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
