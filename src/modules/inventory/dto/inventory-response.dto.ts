import { ApiProperty } from '@nestjs/swagger';

export class InventoryItemDto {
  @ApiProperty({ description: '材料ID', example: 'M001' })
  materialId: string;

  @ApiProperty({ description: '材料名称', example: '红玛瑙' })
  materialName: string;

  @ApiProperty({ description: '分类ID', example: 'C001' })
  categoryId: string;

  @ApiProperty({ description: '分类名称', example: '宝石类' })
  categoryName: string;

  @ApiProperty({ description: '当前库存', example: 100 })
  currentStock: number;

  @ApiProperty({ description: '可用库存', example: 95 })
  availableStock: number;

  @ApiProperty({ description: '预留库存', example: 5 })
  reservedStock: number;

  @ApiProperty({ description: '预警阈值', example: 20 })
  alertThreshold: number;

  @ApiProperty({ description: '库存状态', example: 'normal' })
  stockStatus: string;

  @ApiProperty({ description: '库存价值', example: 1500.0 })
  stockValue: number;

  @ApiProperty({ description: '单价', example: 15.0 })
  unitPrice: number;

  @ApiProperty({
    description: '最后入库时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastInboundAt?: Date;

  @ApiProperty({
    description: '最后出库时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastOutboundAt?: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class InventoryListResponseDto {
  @ApiProperty({ type: [InventoryItemDto] })
  list: InventoryItemDto[];

  @ApiProperty({ description: '总数', example: 100 })
  total: number;

  @ApiProperty({ description: '当前页', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 20 })
  pageSize: number;

  @ApiProperty({ description: '总页数', example: 5 })
  totalPages: number;
}

export class InventoryOperationResponseDto {
  @ApiProperty({ description: '操作ID', example: 'OP001' })
  operationId: string;

  @ApiProperty({ description: '操作前库存', example: 90 })
  beforeStock: number;

  @ApiProperty({ description: '操作后库存', example: 100 })
  afterStock: number;

  @ApiProperty({ description: '调整数量', example: 10 })
  adjustQuantity?: number;

  @ApiProperty({ description: '总价值', example: 1550.0 })
  totalValue?: number;
}

export class BatchOperationResultDto {
  @ApiProperty({ description: '材料ID', example: 'M001' })
  materialId: string;

  @ApiProperty({ description: '操作ID', example: 'OP001' })
  operationId?: string;

  @ApiProperty({ description: '操作前库存', example: 90 })
  beforeStock?: number;

  @ApiProperty({ description: '操作后库存', example: 100 })
  afterStock?: number;

  @ApiProperty({ description: '数量', example: 10 })
  quantity?: number;

  @ApiProperty({ description: '价值', example: 155.0 })
  value?: number;

  @ApiProperty({ description: '错误信息', example: '库存不足' })
  error?: string;
}

export class BatchOperationResponseDto {
  @ApiProperty({ description: '批次ID', example: 'BATCH001' })
  batchId: string;

  @ApiProperty({ description: '成功数量', example: 5 })
  successCount: number;

  @ApiProperty({ description: '失败数量', example: 1 })
  failedCount: number;

  @ApiProperty({ description: '总数量', example: 500 })
  totalQuantity?: number;

  @ApiProperty({ description: '总价值', example: 7750.0 })
  totalValue?: number;

  @ApiProperty({ type: [BatchOperationResultDto] })
  successList: BatchOperationResultDto[];

  @ApiProperty({ type: [BatchOperationResultDto] })
  failedList: BatchOperationResultDto[];
}

export class OperationLogItemDto {
  @ApiProperty({ description: '操作ID', example: 'OP001' })
  operationId: string;

  @ApiProperty({ description: '材料ID', example: 'M001' })
  materialId: string;

  @ApiProperty({ description: '材料名称', example: '红玛瑙' })
  materialName: string;

  @ApiProperty({ description: '操作类型', example: 'inbound' })
  operationType: string;

  @ApiProperty({ description: '数量', example: 100 })
  quantity: number;

  @ApiProperty({ description: '操作前库存', example: 50 })
  beforeStock: number;

  @ApiProperty({ description: '操作后库存', example: 150 })
  afterStock: number;

  @ApiProperty({ description: '单价', example: 15.5 })
  unitPrice?: number;

  @ApiProperty({ description: '总价值', example: 1550.0 })
  totalValue?: number;

  @ApiProperty({ description: '原因', example: '采购' })
  reason: string;

  @ApiProperty({ description: '供应商', example: '供应商A' })
  supplier?: string;

  @ApiProperty({ description: '客户', example: '客户A' })
  customer?: string;

  @ApiProperty({ description: '备注', example: '新采购的红玛瑙' })
  notes?: string;

  @ApiProperty({ description: '操作日期', example: '2024-01-01' })
  operationDate: Date;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '创建人', example: 'admin' })
  createdBy: string;
}

export class OperationLogResponseDto {
  @ApiProperty({ type: [OperationLogItemDto] })
  list: OperationLogItemDto[];

  @ApiProperty({ description: '总数', example: 100 })
  total: number;

  @ApiProperty({ description: '当前页', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 20 })
  pageSize: number;

  @ApiProperty({ description: '总页数', example: 5 })
  totalPages: number;
}
