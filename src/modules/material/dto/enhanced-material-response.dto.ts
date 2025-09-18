import { ApiProperty } from '@nestjs/swagger';
import { ImageDataDto } from '../../upload/dto/upload-image-response.dto';

export class MaterialStatsDto {
  @ApiProperty({ description: '查看次数', example: 150 })
  viewCount: number;

  @ApiProperty({ description: '编辑次数', example: 5 })
  editCount: number;

  @ApiProperty({
    description: '最后查看时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastViewAt?: Date;

  @ApiProperty({
    description: '最后编辑时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastEditAt?: Date;
}

export class MaterialDetailEnhancedResponseDto {
  @ApiProperty({ description: '材料ID', example: 'M001' })
  materialId: string;

  @ApiProperty({ description: '材料名称', example: '红玛瑙' })
  name: string;

  @ApiProperty({ description: '分类ID', example: 'C001' })
  categoryId: string;

  @ApiProperty({ description: '分类名称', example: '宝石类' })
  categoryName: string;

  @ApiProperty({ description: '分类路径', example: '宝石类/玛瑙' })
  categoryPath: string;

  @ApiProperty({ description: '价格', example: 15.5 })
  price: number;

  @ApiProperty({ description: '库存数量', example: 100 })
  stock: number;

  @ApiProperty({ description: '材料描述', example: '天然红玛瑙' })
  description?: string;

  @ApiProperty({ description: '颜色', example: '红色' })
  color?: string;

  @ApiProperty({ description: '硬度', example: 7 })
  hardness?: number;

  @ApiProperty({ description: '密度', example: 2.65 })
  density?: number;

  @ApiProperty({ description: '状态', example: 'enabled' })
  status: string;

  @ApiProperty({ description: '图片列表', type: [ImageDataDto] })
  images: ImageDataDto[];

  @ApiProperty({ description: '统计信息', type: MaterialStatsDto })
  stats: MaterialStatsDto;

  @ApiProperty({
    description: '创建时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '更新时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({ description: '创建人', example: 'admin' })
  createdBy: string;

  @ApiProperty({ description: '更新人', example: 'admin' })
  updatedBy: string;
}



export class CopyMaterialResponseDto {
  @ApiProperty({ description: '新材料ID', example: 'M005' })
  materialId: string;

  @ApiProperty({ description: '新材料名称', example: '红玛瑙(副本)' })
  name: string;
}
