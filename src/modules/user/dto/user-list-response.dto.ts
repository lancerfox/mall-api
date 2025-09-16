import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

/**
 * 用户列表响应数据传输对象
 */
export class UserListResponseDto {
  @ApiProperty({
    description: '用户列表',
    type: [UserResponseDto],
  })
  data: UserResponseDto[];

  @ApiProperty({
    description: '总数量',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: '当前页码',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '每页数量',
    example: 10,
  })
  pageSize: number;

  @ApiProperty({
    description: '总页数',
    example: 10,
  })
  totalPages: number;
}
