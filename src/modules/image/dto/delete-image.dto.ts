import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DeleteImageDto {
  @ApiProperty({
    description: '图片ID（用于单张图片删除）',
    example: 1,
    required: false,
  })
  @IsNumber({}, { message: '图片ID必须是数字' })
  imageId: number;
}
