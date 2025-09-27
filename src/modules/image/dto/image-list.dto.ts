import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class ImageListDto {
  @ApiProperty({
    description: '页码',
    example: 1,
    default: 1,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 20,
    default: 20,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(50)
  pageSize: number = 20;
}
