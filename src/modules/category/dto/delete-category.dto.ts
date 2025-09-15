import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteCategoryDto {
  @ApiProperty({ description: '分类ID', example: 'C003' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
