import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsMongoId } from 'class-validator';

export class DeleteCategoryDto {
  @ApiProperty({
    description: '分类ID',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsNotEmpty({ message: '分类ID不能为空' })
  @IsMongoId({ message: '分类ID格式不正确' })
  id: string;
}
