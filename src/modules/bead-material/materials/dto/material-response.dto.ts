import { ApiProperty } from '@nestjs/swagger';

export class MaterialResponseDto {
  @ApiProperty({ description: '材料ID', example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ description: '材料名称', example: '红玛瑙珠' })
  name: string;

  @ApiProperty({ description: '分类ID', example: '507f1f77bcf86cd799439012' })
  categoryId: string;

  @ApiProperty({ description: '颜色', example: '红色', required: false })
  color?: string;

  @ApiProperty({ description: '尺寸', example: '8mm', required: false })
  size?: string;

  @ApiProperty({ description: '形状', example: '圆形', required: false })
  shape?: string;

  @ApiProperty({ description: '材质', example: '玛瑙', required: false })
  material?: string;

  @ApiProperty({ description: '单位', example: '颗', required: false })
  unit?: string;

  @ApiProperty({ description: '价格', example: 1.5, required: false })
  price?: number;

  @ApiProperty({ description: '库存数量', example: 1000, required: false })
  stock?: number;

  @ApiProperty({ description: '最小库存', example: 100, required: false })
  minStock?: number;

  @ApiProperty({ description: '最大库存', example: 5000, required: false })
  maxStock?: number;

  @ApiProperty({
    description: '描述',
    example: '高品质红玛瑙珠，颜色鲜艳',
    required: false,
  })
  description?: string;

  @ApiProperty({ description: '状态 1-启用 0-禁用', example: 1 })
  status: number;

  @ApiProperty({ description: '创建者ID', example: '507f1f77bcf86cd799439013' })
  createdBy: string;

  @ApiProperty({
    description: '更新者ID',
    example: '507f1f77bcf86cd799439013',
    required: false,
  })
  updatedBy?: string;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class MaterialListResponseDto {
  @ApiProperty({ type: [MaterialResponseDto], description: '材料列表' })
  data: MaterialResponseDto[];

  @ApiProperty({ description: '总数量', example: 500 })
  total: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 10 })
  limit: number;

  @ApiProperty({ description: '总页数', example: 50 })
  totalPages: number;
}

export class MaterialDetailResponseDto {
  @ApiProperty({ type: MaterialResponseDto, description: '材料详情' })
  data: MaterialResponseDto;
}

export class MaterialCreateResponseDto {
  @ApiProperty({ description: '响应消息', example: '材料创建成功' })
  message: string;

  @ApiProperty({ type: MaterialResponseDto, description: '创建的材料信息' })
  data: MaterialResponseDto;
}

export class MaterialUpdateResponseDto {
  @ApiProperty({ description: '响应消息', example: '材料更新成功' })
  message: string;

  @ApiProperty({ type: MaterialResponseDto, description: '更新后的材料信息' })
  data: MaterialResponseDto;
}

export class MaterialDeleteResponseDto {
  @ApiProperty({ description: '响应消息', example: '材料删除成功' })
  message: string;
}

export class MaterialStockUpdateResponseDto {
  @ApiProperty({ description: '响应消息', example: '库存更新成功' })
  message: string;

  @ApiProperty({ type: MaterialResponseDto, description: '更新后的材料信息' })
  data: MaterialResponseDto;
}
