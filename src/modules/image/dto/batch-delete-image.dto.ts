import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class BatchDeleteImageDto {
  @ApiProperty({
    description: '图片ID数组',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  imageIds: string[];
}
