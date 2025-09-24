import { ApiProperty } from '@nestjs/swagger';
import { SpuDto } from './spu.dto';
import { SkuDto } from './sku.dto';

export class ProductEditResponseDto {
  @ApiProperty({ description: 'SPU信息', type: SpuDto })
  spu: SpuDto;

  @ApiProperty({ description: 'SKU列表', type: [SkuDto] })
  skus: SkuDto[];

  @ApiProperty({ 
    description: '操作类型', 
    example: 'saveToDraft',
    enum: ['saveToDraft', 'publish'] 
  })
  action: string;
}