import { ApiProperty } from '@nestjs/swagger';

/**
 * 角色响应数据传输对象
 */
export class RoleResponseDto {
  @ApiProperty({
    description: '角色ID',
    example: '60d21b4667d0d8992e610c85',
  })
  id: string;

  @ApiProperty({
    description: '角色名称',
    example: 'super_admin',
  })
  name: string;
}
