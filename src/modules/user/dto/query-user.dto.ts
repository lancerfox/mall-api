import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumberString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

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
  })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: '用户名搜索',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: '邮箱搜索',
    example: 'admin@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: '真实姓名搜索',
    example: '管理员',
  })
  @IsOptional()
  @IsString()
  realName?: string;

  @ApiPropertyOptional({
    description: '角色筛选',
    example: 'admin',
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: '状态筛选',
    example: 'active',
    enum: UserStatus,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
