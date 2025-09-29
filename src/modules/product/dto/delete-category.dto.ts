import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteCategoryDto {
  @ApiProperty({
    description: '分类ID',
    example: '507f1f77-bc11-1cd7-9943-9011bcf86cd7',
    required: true,
  })
  @IsNotEmpty({ message: '分类ID不能为空' })
  @IsUUID('4', { message: '分类ID格式不正确' })
  id: string;
}
