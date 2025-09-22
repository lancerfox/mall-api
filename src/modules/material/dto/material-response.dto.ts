import { ApiProperty } from '@nestjs/swagger';
import { Material } from '../entities/material.entity';

export class MaterialStatsDto {
  @ApiProperty({ description: '查看次数', example: 150 })
  viewCount: number;

  @ApiProperty({ description: '编辑次数', example: 5 })
  editCount: number;

  @ApiProperty({
    description: '最后查看时间',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  lastViewAt?: Date;

  @ApiProperty({
    description: '最后编辑时间',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  lastEditAt?: Date;

  constructor(stats?: Partial<MaterialStatsDto>) {
    this.viewCount = stats?.viewCount || 0;
    this.editCount = stats?.editCount || 0;
    this.lastViewAt = stats?.lastViewAt || null;
    this.lastEditAt = stats?.lastEditAt || null;
  }
}

export class MaterialResponseDto {
  @ApiProperty({ description: '材料ID', example: 'M001' })
  materialId: string;

  @ApiProperty({ description: '材料名称', example: '红玛瑙' })
  name: string;

  @ApiProperty({ description: '分类ID', example: 'C001' })
  categoryId: string;

  @ApiProperty({ description: '分类名称', example: '宝石类' })
  categoryName: string;

  @ApiProperty({ description: '分类路径', example: '宝石类/玛瑙' })
  categoryPath: string;

  @ApiProperty({ description: '材料描述', example: '天然红玛瑙' })
  description: string;

  @ApiProperty({ description: '颜色', example: '红色' })
  color: string;

  @ApiProperty({ description: '硬度(1-10)', example: 7 })
  hardness: number;

  @ApiProperty({ description: '密度', example: 2.65 })
  density: number;

  @ApiProperty({
    description: '状态',
    example: 'enabled',
    enum: ['enabled', 'disabled'],
  })
  status: string;

  @ApiProperty({ description: '图片URL列表', example: [] })
  images: string[];

  @ApiProperty({ description: '统计信息' })
  stats: MaterialStatsDto;

  @ApiProperty({
    description: '创建时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '更新时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({ description: '创建人ID', example: 'user123' })
  createdBy: string;

  @ApiProperty({ description: '更新人ID', example: 'user123' })
  updatedBy: string;

  constructor(material: Material) {
    this.materialId = material.materialId;
    this.name = material.name;
    this.categoryId = material.categoryId;
    this.description = material.description;
    this.color = material.color;
    this.hardness = material.hardness;
    this.density = material.density;
    this.status = material.status;
    this.createdAt = material.createdAt;
    this.updatedAt = material.updatedAt;
    this.createdBy = material.createdBy;
    this.updatedBy = material.updatedBy;
  }
}

export class MaterialListResponseDto {
  @ApiProperty({ description: '材料列表', type: [MaterialResponseDto] })
  list: MaterialResponseDto[];

  @ApiProperty({ description: '总记录数', example: 100 })
  total: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 20 })
  pageSize: number;

  constructor(
    list: MaterialResponseDto[],
    total: number,
    page: number,
    pageSize: number,
  ) {
    this.list = list;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
  }
}

export class CreateMaterialResponseDto {
  @ApiProperty({ description: '创建的材料ID', example: 'M001' })
  materialId: string;

  constructor(materialId: string) {
    this.materialId = materialId;
  }
}
