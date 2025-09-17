import { IsString, IsNotEmpty } from 'class-validator';
import { UpdatePermissionDto } from './update-permission.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionWithIdDto extends UpdatePermissionDto {
  @ApiProperty({
    description: '要更新的权限ID',
    example: '60f1b2b3b3b3b3b3b3b3b3b3',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
