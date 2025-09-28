import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsNumber } from 'class-validator';

export class BatchDeleteImageDto {
  @ApiProperty({
    description: '图片ID数组（用于批量删除）',
    example: [1, 2, 3],
    required: true,
    type: [Number],
  })
  @IsNotEmpty({ message: '图片ID数组不能为空' })
  @IsArray({ message: '图片ID必须是数组' })
  @IsNumber({}, { each: true, message: '图片ID必须是数字' })
  imageIds: number[];
}
