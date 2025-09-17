import { ApiProperty } from '@nestjs/swagger';
import { SearchCondition } from '../entities/search-condition.entity';

export class AdvancedSearchResponseDto {
  @ApiProperty({ description: '材料列表', type: Array })
  list: any[];

  @ApiProperty({ description: '总记录数', example: 50 })
  total: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 20 })
  pageSize: number;

  @ApiProperty({ description: '总页数', example: 3 })
  totalPages: number;

  @ApiProperty({ description: '搜索耗时（毫秒）', example: 120 })
  searchTime: number;
}

export class SearchConditionResponseDto {
  @ApiProperty({ description: '搜索条件ID', example: 'SC001' })
  conditionId: string;

  @ApiProperty({ description: '搜索条件名称', example: '高价值宝石' })
  name: string;

  @ApiProperty({ description: '搜索条件JSON', type: Object })
  conditions: Record<string, any>;

  @ApiProperty({ description: '是否为默认条件', example: false })
  isDefault: boolean;

  @ApiProperty({ description: '使用次数', example: 5 })
  useCount: number;

  @ApiProperty({
    description: '最后使用时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastUsedAt?: Date;

  @ApiProperty({
    description: '创建时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  constructor(condition: SearchCondition) {
    this.conditionId = condition.conditionId;
    this.name = condition.name;
    this.conditions = condition.conditions;
    this.isDefault = condition.isDefault;
    this.useCount = condition.useCount;
    this.lastUsedAt = condition.lastUsedAt;
    this.createdAt = condition.createdAt;
  }
}

export class SaveSearchConditionResponseDto {
  @ApiProperty({ description: '搜索条件ID', example: 'SC001' })
  conditionId: string;
}
