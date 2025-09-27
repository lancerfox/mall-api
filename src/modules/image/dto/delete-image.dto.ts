import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteImageDto {
  @ApiProperty({
    description: '图片ID',
    example: 1,
    required: true,
  })
  @IsNotEmpty({ message: '图片ID不能为空' })
  @IsNumber({}, { message: '图片ID必须是数字' })
  imageId: number;
}
