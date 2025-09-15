import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  Min,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class MaterialListDto {
  @ApiProperty({ description: '页码', example: 1 })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page: number;

  @ApiProperty({ description: '每页数量', example: 20, enum: [10, 20, 50] })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsEnum([10, 20, 50])
  pageSize: number;

  @ApiProperty({ description: '搜索关键词', example: '', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  keyword?: string;

  @ApiProperty({ description: '分类ID', example: '', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: '状态筛选',
    example: '',
    enum: ['enabled', 'disabled'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['enabled', 'disabled'])
  status?: string;
}
