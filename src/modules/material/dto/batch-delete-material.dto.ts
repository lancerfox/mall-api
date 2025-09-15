import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, ArrayMaxSize, IsString } from 'class-validator';

export class BatchDeleteMaterialDto {
  @ApiProperty({
    description: '材料ID数组',
    example: ['M001', 'M002', 'M003'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  materialIds: string[];
}
