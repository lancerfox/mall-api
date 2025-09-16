import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../entities/category.entity';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';

export class CategoryResponseDto {
  @ApiProperty({ example: '674a1b2c3d4e5f6789012345' })
  _id: string;

  @ApiProperty({ example: 'CAT001' })
  categoryId: string;

  @ApiProperty({ example: '戒指' })
  name: string;

  @ApiProperty({ example: 'ring', required: false })
  englishName?: string;

  @ApiProperty({ example: 'parent_category_id', required: false })
  parentId?: string;

  @ApiProperty({ example: 1 })
  level: number;

  @ApiProperty({ example: 1 })
  sort: number;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: 'user_id', required: false })
  createdBy?: string;

  @ApiProperty({ example: 'user_id', required: false })
  updatedBy?: string;

  @ApiProperty({ type: [CategoryResponseDto], required: false })
  children?: CategoryResponseDto[];
}

export class CategoryTreeResponseDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  categories: CategoryResponseDto[];
}

export class CategoryListResponseDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  categories: CategoryResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}

export class CreateCategoryResponseDto {
  @ApiProperty({ example: 'CAT001' })
  categoryId: string;
}

export class BatchDeleteResponseDto {
  @ApiProperty({ example: 5 })
  deletedCount: number;

  @ApiProperty({ example: 5 })
  successCount: number;

  @ApiProperty({ example: 0 })
  failedCount: number;
}

export class MoveCategoryResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '分类移动成功' })
  message: string;
}
