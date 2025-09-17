import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, ArrayMaxSize, IsString } from 'class-validator';

export class BatchDeleteMaterialDto {
  @ApiProperty({
    description: '材料ID数组',
    example: ['60f1b2b3b3b3b3b3b3b3b3b3', '60f1b2b3b3b3b3b3b3b3b3b4'],
    type: [String],
    required: true,
    minItems: 1,
    maxItems: 100,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  materialIds: string[];
}
