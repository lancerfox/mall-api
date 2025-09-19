import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { InventoryStatus } from '../entities/inventory.entity';

export class InventoryListDto extends PaginationDto {
  @ApiProperty({ description: '按素材名称模糊搜索', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: '分类ID', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: '上架状态',
    enum: InventoryStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;
}
