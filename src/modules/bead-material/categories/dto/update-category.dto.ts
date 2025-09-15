import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsMongoId({ message: '分类ID格式不正确' })
  @IsNotEmpty({ message: '分类ID不能为空' })
  id: string;
}
