import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsUUID } from 'class-validator';

export class DeleteProductDto {
  @ApiProperty({
    description: 'SPU ID列表',
    example: ['507f1f77-bc11-1cd7-9943-9011bcf86cd7'],
    type: [String],
    required: true,
  })
  @IsNotEmpty({ message: 'SPU ID列表不能为空' })
  @IsArray({ message: 'SPU ID必须是数组' })
  @IsUUID('4', { each: true, message: '每个SPU ID格式不正确' })
  ids: string[];
}
