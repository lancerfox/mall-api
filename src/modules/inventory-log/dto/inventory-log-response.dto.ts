import { ApiProperty } from '@nestjs/swagger';
import { OperationType } from '../entities/inventory-log.entity';

export class InventoryLogItemDto {
  @ApiProperty({ description: '日志ID' })
  logId: string;

  @ApiProperty({ description: '操作员名称' })
  operatorName: string;

  @ApiProperty({ description: '素材名称' })
  materialName: string;

  @ApiProperty({ description: '操作类型', enum: OperationType })
  operationType: string;

  @ApiProperty({ description: '操作前的值' })
  beforeValue: string;

  @ApiProperty({ description: '操作后的值' })
  afterValue: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;
}

export class InventoryLogListResponseDto {
  @ApiProperty({ type: [InventoryLogItemDto] })
  list: InventoryLogItemDto[];

  @ApiProperty({ description: '总数' })
  total: number;
}
