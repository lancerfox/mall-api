import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UploadTokenDto {
  @ApiProperty({
    description: '业务模块名称（用于文件夹分类）',
    example: 'product',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessModule?: string;

  @ApiProperty({
    description: '文件类型',
    example: 'image/png',
  })
  @IsNotEmpty()
  @IsString()
  fileType: string;
}
