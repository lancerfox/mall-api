import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from './product-response.dto';

export class ProductListPaginatedDto {
  @ApiProperty({ type: [ProductResponseDto], description: '商品列表' })
  list: ProductResponseDto[];

  @ApiProperty({ type: 'number', description: '总数' })
  total: number;

  @ApiProperty({ type: 'number', description: '当前页码' })
  page: number;

  @ApiProperty({ type: 'number', description: '每页数量' })
  pageSize: number;

  @ApiProperty({ type: 'number', description: '总页数' })
  totalPages: number;
}
