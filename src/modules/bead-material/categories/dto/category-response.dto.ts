import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ description: '分类ID', example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ description: '分类名称', example: '水晶珠' })
  name: string;

  @ApiProperty({
    description: '分类描述',
    example: '各种水晶材质的珠子',
    required: false,
  })
  description?: string;

  @ApiProperty({ description: '状态 1-启用 0-禁用', example: 1 })
  status: number;

  @ApiProperty({ description: '创建者ID', example: '507f1f77bcf86cd799439012' })
  createdBy: string;

  @ApiProperty({
    description: '更新者ID',
    example: '507f1f77bcf86cd799439012',
    required: false,
  })
  updatedBy?: string;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class CategoryListResponseDto {
  @ApiProperty({ type: [CategoryResponseDto], description: '分类列表' })
  data: CategoryResponseDto[];

  @ApiProperty({ description: '总数量', example: 100 })
  total: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 10 })
  limit: number;

  @ApiProperty({ description: '总页数', example: 10 })
  totalPages: number;
}

export class CategoryDetailResponseDto {
  @ApiProperty({ type: CategoryResponseDto, description: '分类详情' })
  data: CategoryResponseDto;
}

export class CategoryCreateResponseDto {
  @ApiProperty({ description: '响应消息', example: '分类创建成功' })
  message: string;

  @ApiProperty({ type: CategoryResponseDto, description: '创建的分类信息' })
  data: CategoryResponseDto;
}

export class CategoryUpdateResponseDto {
  @ApiProperty({ description: '响应消息', example: '分类更新成功' })
  message: string;

  @ApiProperty({ type: CategoryResponseDto, description: '更新后的分类信息' })
  data: CategoryResponseDto;
}

export class CategoryDeleteResponseDto {
  @ApiProperty({ description: '响应消息', example: '分类删除成功' })
  message: string;
}
