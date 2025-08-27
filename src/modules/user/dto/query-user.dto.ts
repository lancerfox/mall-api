import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

// 辅助函数：将空字符串转换为 undefined
const emptyStringToUndefined = ({ value }: { value: unknown }) =>
  value === '' ? undefined : value;

/**
 * 用户角色
 */
export enum UserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  OPERATOR = 'operator',
}

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
  @Transform(({ value }: { value: unknown }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : parseInt(String(value), 10),
  )
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
  @Transform(({ value }: { value: unknown }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : parseInt(String(value), 10),
  )
  @IsOptional()
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量不能小于1' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: '用户名搜索',
    example: 'admin',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: '邮箱搜索',
    example: 'admin@example.com',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: '真实姓名搜索',
    example: '管理员',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString()
  realName?: string;

  @ApiPropertyOptional({
    description: '角色筛选',
    example: 'admin',
    enum: UserRole,
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

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
