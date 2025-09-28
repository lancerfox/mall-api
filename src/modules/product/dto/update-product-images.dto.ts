import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductImageDto {
  @ApiProperty({
    description: '图片ID',
    example: '3',
  })
  @IsNotEmpty()
  @IsString()
  imageId: string;

  @ApiProperty({
    description: '是否为主图',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isMain: boolean;
}

export class UpdateProductImagesDto {
  @ApiProperty({
    description: '商品ID',
    example: '101',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    description: '图片对象数组，数组顺序即为图片显示顺序',
    type: [ProductImageDto],
    example: [
      { imageId: 3, isMain: true },
      { imageId: 5, isMain: false },
      { imageId: 2, isMain: false },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images: ProductImageDto[];
}
