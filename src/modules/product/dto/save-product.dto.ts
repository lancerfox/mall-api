import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SpuDto } from './spu.dto';
import { SkuDto } from './sku.dto';

export class SaveProductDto {
  @ApiProperty({ description: 'SPU信息', type: SpuDto, required: true })
  @ValidateNested()
  @Type(() => SpuDto)
  spu: SpuDto;

  @ApiProperty({ description: 'SKU列表', type: [SkuDto], required: true })
  @IsNotEmpty({ message: 'SKU列表不能为空' })
  @IsArray({ message: 'SKU必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => SkuDto)
  skus: SkuDto[];

  @ApiProperty({
    description: '操作类型',
    example: 'saveToDraft',
    enum: ['saveToDraft', 'publish'],
    required: true,
  })
  @IsNotEmpty({ message: '操作类型不能为空' })
  @IsString({ message: '操作类型必须是字符串' })
  @IsIn(['saveToDraft', 'publish'], {
    message: '操作类型只能是saveToDraft或publish',
  })
  action: string;
}
