import { IsArray, IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 批量操作数据传输对象
 */
export class BatchOperationDto {
  @ApiProperty({
    description: '用户ID列表',
    example: ['60f1b2b3b3b3b3b3b3b3b3b3', '60f1b2b3b3b3b3b3b3b3b3b4'],
    type: [String],
    required: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  userIds: string[];
}

/**
 * 批量更新状态数据传输对象
 */
export class BatchUpdateStatusDto extends BatchOperationDto {
  @ApiProperty({
    description: '新状态',
    example: 'inactive',
    enum: ['active', 'inactive', 'locked'],
    required: true,
  })
  @IsEnum(['active', 'inactive', 'locked'])
  @IsNotEmpty()
  status: string;
}
