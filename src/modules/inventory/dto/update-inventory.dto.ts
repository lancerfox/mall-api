import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class UpdateInventoryDto {
  @ApiProperty({ description: '库存ID', required: true })
  @IsString()
  @IsNotEmpty()
  inventoryId: string;

  @ApiProperty({ description: '价格', required: false, minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @ApiProperty({ description: '库存数量', required: false, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}
