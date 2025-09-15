import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialDto } from './create-material.dto';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {
  @IsMongoId({ message: '材料ID格式不正确' })
  @IsNotEmpty({ message: '材料ID不能为空' })
  id: string;
}
