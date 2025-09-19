import { ApiProperty } from '@nestjs/swagger';
import { InventoryStatus } from '../entities/inventory.entity';

export class InventoryItemDto {
  @ApiProperty({ description: '库存ID' })
  inventoryId: string;

  @ApiProperty({ description: '素材ID' })
  materialId: string;

  @ApiProperty({ description: '素材名称' })
  materialName: string;

  @ApiProperty({ description: '分类名称' })
  categoryName: string;

  @ApiProperty({ description: '价格' })
  price: number;

  @ApiProperty({ description: '库存数量' })
  stock: number;

  @ApiProperty({ description: '上架状态', enum: InventoryStatus })
  status: string;
}

export class InventoryListResponseDto {
  @ApiProperty({ type: [InventoryItemDto] })
  list: InventoryItemDto[];

  @ApiProperty({ description: '总数' })
  total: number;
}
