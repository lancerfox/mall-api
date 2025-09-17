import { IsString, IsNotEmpty } from 'class-validator';
import { UpdateRoleDto } from './update-role.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleWithIdDto extends UpdateRoleDto {
  @ApiProperty({
    description: '要更新的角色ID',
    example: '60f1b2b3b3b3b3b3b3b3b3b3',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
