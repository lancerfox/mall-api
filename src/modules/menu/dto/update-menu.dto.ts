import { PartialType } from '@nestjs/swagger';
import { CreateMenuDto } from './create-menu.dto';
import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @ApiProperty({
    description: '菜单ID',
    example: '507f1f77-bc11-1cd7-9943-9011bcf86cd7',
  })
  @IsUUID('4', { message: '菜单ID格式不正确' })
  id: string;

  @ApiProperty({
    description: '状态',
    required: false,
    enum: ['active', 'inactive'],
    example: 'active',
    default: 'active',
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;
}
