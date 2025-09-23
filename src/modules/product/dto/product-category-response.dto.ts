import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 商品分类响应数据传输对象
 */
export class ProductCategoryResponseDto {
  @ApiProperty({
    description: '分类ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: '分类名称',
    example: '手机',
  })
  name: string;

  @ApiProperty({
    description: '分类编码',
    example: 'PHONE',
  })
  code: string;

  @ApiPropertyOptional({
    description: '父分类ID',
    example: null,
  })
  parentId?: string;

  @ApiProperty({
    description: '分类级别',
    example: 1,
  })
  level: number;

  @ApiProperty({
    description: '排序序号',
    example: 1,
  })
  sort: number;

  @ApiProperty({
    description: '是否启用',
    example: true,
  })
  enabled: boolean;

  @ApiPropertyOptional({
    description: '图标URL',
    example: 'https://example.com/icon.png',
  })
  icon?: string;

  @ApiPropertyOptional({
    description: '描述',
    example: '手机分类',
  })
  description?: string;

  @ApiProperty({
    description: '创建时间',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '更新时间',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: '子分类列表',
    type: [ProductCategoryResponseDto],
  })
  children?: ProductCategoryResponseDto[];
}

/**
 * 商品分类列表响应数据传输对象
 */
export class ProductCategoryListResponseDto {
  @ApiProperty({
    description: '分类列表',
    type: [ProductCategoryResponseDto],
  })
  data: ProductCategoryResponseDto[];

  @ApiProperty({
    description: '总数量',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: '当前页码',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '每页数量',
    example: 10,
  })
  pageSize: number;

  @ApiProperty({
    description: '总页数',
    example: 10,
  })
  totalPages: number;
}
