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
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
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
    enum: ['admin', 'super_admin', 'operator'],
  })
  @IsOptional()
  @IsEnum(['admin', 'super_admin', 'operator'])
  role?: string;

  @ApiPropertyOptional({
    description: '状态筛选',
    example: 'active',
    enum: ['active', 'inactive', 'locked'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'locked'])
  status?: string;
}
