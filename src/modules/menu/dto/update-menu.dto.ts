import { PartialType } from '@nestjs/swagger';
import { CreateMenuDto } from './create-menu.dto';
import { IsOptional, IsMongoId, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @ApiProperty({ description: '菜单ID', example: '60f1b2b3b3b3b3b3b3b3b3b3' })
  @IsMongoId()
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
