import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
} from 'class-validator';

export class SpuDto {
  @ApiProperty({
    description: 'SPU ID，更新时必填',
    example: null,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'SPU ID必须是字符串' })
  id?: string;

  @ApiProperty({
    description: '商品名称',
    example: '越南芽庄沉香手串',
    required: true,
  })
  @IsNotEmpty({ message: '商品名称不能为空' })
  @IsString({ message: '商品名称必须是字符串' })
  name: string;

  @ApiProperty({
    description: '副标题',
    example: '天然沉香，香气持久',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '副标题必须是字符串' })
  subtitle?: string;

  @ApiProperty({
    description: '末级分类ID',
    example: '507f1f77-bc11-1cd7-9943-9011bcf86cd7',
    required: true,
  })
  @IsNotEmpty({ message: '分类ID不能为空' })
  @IsUUID('4', { message: '分类ID格式不正确' })
  categoryId: string;

  @ApiProperty({
    description: '主图URL',
    example: 'https://example.com/main.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '主图必须是字符串' })
  mainImage?: string;

  @ApiProperty({
    description: '视频URL',
    example: 'https://example.com/video.mp4',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '视频必须是字符串' })
  video?: string;

  @ApiProperty({ description: '材质', example: '沉香', required: true })
  @IsNotEmpty({ message: '材质不能为空' })
  @IsString({ message: '材质必须是字符串' })
  material: string;

  @ApiProperty({ description: '产地', example: '越南芽庄', required: false })
  @IsOptional()
  @IsString({ message: '产地必须是字符串' })
  origin?: string;

  @ApiProperty({ description: '品级', example: 'A级', required: false })
  @IsOptional()
  @IsString({ message: '品级必须是字符串' })
  grade?: string;

  @ApiProperty({
    description: '商品详情',
    example: '<p>天然沉香手串</p>',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '商品详情必须是字符串' })
  description?: string;

  @ApiProperty({ description: '固定运费', example: 10, required: false })
  @IsOptional()
  @IsNumber({}, { message: '运费必须是数字' })
  freight?: number;

  @ApiProperty({ description: '排序', example: 0, required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序必须是数字' })
  sort?: number;
}
