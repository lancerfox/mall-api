import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, IsString } from 'class-validator';

export class ShelveInventoryDto {
  @ApiProperty({ description: '库存ID列表', type: [String], required: true })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  inventoryIds: string[];
}
