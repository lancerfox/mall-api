import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategoryResponseDto } from './product-category-response.dto';

/**
 * 商品规格值响应对象
 */
export class SpecificationValueResponseDto {
  @ApiProperty({
    description: '规格值ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: '规格值名称',
    example: '黑色',
  })
  name: string;

  @ApiPropertyOptional({
    description: '规格值图片',
    example: 'https://example.com/black.png',
  })
  image?: string;
}

/**
 * 商品规格响应对象
 */
export class SpecificationResponseDto {
  @ApiProperty({
    description: '规格ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: '规格名称',
    example: '颜色',
  })
  name: string;

  @ApiProperty({
    description: '规格值列表',
    type: [SpecificationValueResponseDto],
  })
  values: SpecificationValueResponseDto[];
}

/**
 * 商品SKU响应对象
 */
export class SkuResponseDto {
  @ApiProperty({
    description: 'SKU ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'SKU编码',
    example: 'IPHONE13-BLACK-128GB',
  })
  skuCode: string;

  @ApiProperty({
    description: '价格',
    example: 5999,
  })
  price: number;

  @ApiProperty({
    description: '原价',
    example: 6999,
  })
  originalPrice: number;

  @ApiProperty({
    description: '库存数量',
    example: 100,
  })
  stock: number;

  @ApiProperty({
    description: '规格组合',
    example: { color: '黑色', storage: '128GB' },
    type: Object,
  })
  specs: Record<string, string>;

  @ApiProperty({
    description: '是否启用',
    example: true,
  })
  enabled: boolean;

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
}

/**
 * 商品SPU响应数据传输对象
 */
export class ProductResponseDto {
  @ApiProperty({
    description: '商品ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: '商品名称',
    example: 'iPhone 13',
  })
  name: string;

  @ApiProperty({
    description: '商品编码',
    example: 'IPHONE13',
  })
  spuCode: string;

  @ApiProperty({
    description: '商品分类',
    type: ProductCategoryResponseDto,
  })
  category: ProductCategoryResponseDto;

  @ApiProperty({
    description: '商品描述',
    example: '最新款iPhone手机',
  })
  description: string;

  @ApiProperty({
    description: '主图URL',
    example: 'https://example.com/iphone13.jpg',
  })
  mainImage: string;

  @ApiProperty({
    description: '商品图册',
    example: [
      'https://example.com/iphone13-1.jpg',
      'https://example.com/iphone13-2.jpg',
    ],
    type: [String],
  })
  imageGallery: string[];

  @ApiProperty({
    description: '商品规格列表',
    type: [SpecificationResponseDto],
  })
  specifications: SpecificationResponseDto[];

  @ApiProperty({
    description: 'SKU列表',
    type: [SkuResponseDto],
  })
  skus: SkuResponseDto[];

  @ApiProperty({
    description: '是否启用',
    example: true,
  })
  enabled: boolean;

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
}

/**
 * 商品详情响应数据传输对象
 */
export class ProductDetailResponseDto extends ProductResponseDto {
  @ApiProperty({
    description: '商品详情HTML内容',
    example: '<p>这是商品详情内容</p>',
  })
  detailHtml: string;

  @ApiProperty({
    description: '商品参数',
    example: { weight: '200g', dimensions: '146.7×71.5×7.65mm' },
    type: Object,
  })
  parameters: Record<string, string>;

  @ApiProperty({
    description: '售后服务',
    example: '7天无理由退货',
  })
  afterSalesService: string;

  @ApiProperty({
    description: '包装清单',
    example: ['手机×1', '充电器×1', '数据线×1'],
    type: [String],
  })
  packageList: string[];
}

/**
 * 商品列表响应数据传输对象
 */
export class ProductListResponseDto {
  @ApiProperty({
    description: '商品列表',
    type: [ProductResponseDto],
  })
  data: ProductResponseDto[];

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
