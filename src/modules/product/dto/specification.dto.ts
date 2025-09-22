import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SpecificationDto {
  @ApiProperty({ description: '规格键', example: '珠子直径', required: true })
  @IsNotEmpty({ message: '规格键不能为空' })
  @IsString({ message: '规格键必须是字符串' })
  key: string;

  @ApiProperty({ description: '规格值', example: '8mm', required: true })
  @IsNotEmpty({ message: '规格值不能为空' })
  @IsString({ message: '规格值必须是字符串' })
  value: string;
}
