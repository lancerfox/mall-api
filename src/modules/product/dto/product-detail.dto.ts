import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsMongoId } from 'class-validator';

export class ProductDetailDto {
  @ApiProperty({
    description: 'SPU ID',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsNotEmpty({ message: 'SPU ID不能为空' })
  @IsMongoId({ message: 'SPU ID格式不正确' })
  id: string;
}
