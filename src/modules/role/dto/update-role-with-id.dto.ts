import { IsString, IsNotEmpty } from 'class-validator';
import { UpdateRoleDto } from './update-role.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleWithIdDto extends UpdateRoleDto {
  @ApiProperty({ description: 'The id of the role to update' })
  @IsString()
  @IsNotEmpty()
  id: string;
}
