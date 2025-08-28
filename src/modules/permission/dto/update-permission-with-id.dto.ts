import { IsString, IsNotEmpty } from 'class-validator';
import { UpdatePermissionDto } from './update-permission.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionWithIdDto extends UpdatePermissionDto {
  @ApiProperty({ description: 'The id of the permission to update' })
  @IsString()
  @IsNotEmpty()
  id: string;
}
