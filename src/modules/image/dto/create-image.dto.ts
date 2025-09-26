import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({
    description: '图片公网URL (Supabase)',
    example: 'https://example.supabase.co/storage/v1/object/public/images/avatar.png',
  })
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @ApiProperty({
    description: '图片在Supabase中的路径',
    example: 'public/avatar.png',
  })
  @IsNotEmpty()
  @IsString()
  path: string;
}