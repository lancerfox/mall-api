import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

export class UpdateUserWithIdDto extends UpdateUserDto {
  @ApiProperty({
    description: '用户ID',
    example: '60f1b2b3b3b3b3b3b3b3b3b3',
    required: true,
  })
  @IsNotEmpty({ message: '用户ID不能为空' })
  @IsString({ message: '用户ID必须是字符串' })
  @IsMongoId({ message: '用户ID格式不正确' })
  id: string;
}
