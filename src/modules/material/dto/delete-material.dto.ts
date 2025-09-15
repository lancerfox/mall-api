import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteMaterialDto {
  @ApiProperty({ description: '材料ID', example: 'M001' })
  @IsString()
  @IsNotEmpty()
  materialId: string;
}
