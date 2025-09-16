import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

// 辅助函数：将空字符串转换为 undefined
const emptyStringToUndefined = ({ value }: { value: unknown }) =>
  value === '' ? undefined : value;

// 辅助函数：安全地将值转换为整数
const safeTransformToInt = ({
  value,
}: {
  value: unknown;
}): number | undefined => {
  // 忽略 null, undefined 和空字符串
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  // 如果是数字，直接取整
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.floor(value);
  }

  // 如果是字符串，尝试解析
  if (typeof value === 'string') {
    const num = parseInt(value, 10);
    // 如果解析结果不是数字（比如非数字字符串解析后是NaN），则返回 undefined
    return isNaN(num) ? undefined : num;
  }

  // 其他类型不支持转换，返回 undefined
  return undefined;
};

/**
 * 用户状态
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
}

/**
 * 查询用户数据传输对象
 */
export class QueryUserDto {
  @ApiPropertyOptional({
    description: '页码',
    example: 1,
    minimum: 1,
    type: Number,
  })
  @Transform(safeTransformToInt)
  @IsOptional()
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码不能小于1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    minimum: 1,
    type: Number,
  })
  @Transform(safeTransformToInt)
  @IsOptional()
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量不能小于1' })
  pageSize?: number = 10;

  @ApiPropertyOptional({
    description: '用户名搜索',
    example: 'admin',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: '角色ID筛选',
    example: '60c72b9b9b1e8a001f8e8b8b',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString()
  roles?: string;

  @ApiPropertyOptional({
    description: '状态筛选',
    example: 'active',
    enum: UserStatus,
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
