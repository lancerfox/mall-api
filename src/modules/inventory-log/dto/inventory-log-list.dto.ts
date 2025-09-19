import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class InventoryLogListDto extends PaginationDto {
  @ApiProperty({ description: '按操作员名称搜索', required: false })
  @IsOptional()
  @IsString()
  operatorName?: string;

  @ApiProperty({ description: '按素材名称搜索', required: false })
  @IsOptional()
  @IsString()
  materialName?: string;

  @ApiProperty({ description: '开始日期 (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: '结束日期 (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
