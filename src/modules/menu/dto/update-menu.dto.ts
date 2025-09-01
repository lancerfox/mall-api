import { PartialType } from '@nestjs/swagger';
import { CreateMenuDto } from './create-menu.dto';
import { IsOptional, IsMongoId, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @ApiProperty({ description: '菜单ID' })
  @IsMongoId()
  id: string;

  @ApiProperty({
    description: '状态',
    required: false,
    enum: ['active', 'inactive'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;
}
