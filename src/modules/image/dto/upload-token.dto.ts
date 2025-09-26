import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadTokenDto {
  @ApiProperty({
    description: '文件名',
    example: 'test.png',
  })
  @IsNotEmpty()
  @IsString()
  fileName: string;
}