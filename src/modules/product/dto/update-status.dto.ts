import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsString, IsIn, IsUUID } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'SPU ID列表',
    example: ['507f1f77-bc11-1cd7-9943-9011bcf86cd7'],
    type: [String],
    required: true,
  })
  @IsNotEmpty({ message: 'SPU ID列表不能为空' })
  @IsArray({ message: 'SPU ID必须是数组' })
  @IsUUID('4', { each: true, message: '每个SPU ID格式不正确' })
  ids: string[];

  @ApiProperty({
    description: '目标状态',
    example: 'On-shelf',
    enum: ['On-shelf', 'Off-shelf', 'Deleted'],
    required: true,
  })
  @IsNotEmpty({ message: '目标状态不能为空' })
  @IsString({ message: '目标状态必须是字符串' })
  @IsIn(['On-shelf', 'Off-shelf', 'Deleted'], {
    message: '目标状态只能是On-shelf、Off-shelf或Deleted',
  })
  status: string;
}
