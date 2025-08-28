import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Permissions('role:create')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @Permissions('role:read')
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @Permissions('role:read')
  findOne(@Param('id') id: string) {
    return this.roleService.findById(id);
  }

  @Patch(':id')
  @Permissions('role:update')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Permissions('role:delete')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }

  @Post(':id/permissions')
  @Permissions('role:update')
  addPermissions(
    @Param('id') id: string,
    @Body('permissionIds') permissionIds: string[],
  ) {
    return this.roleService.addPermissions(id, permissionIds);
  }

  @Delete(':id/permissions')
  @Permissions('role:update')
  removePermissions(
    @Param('id') id: string,
    @Body('permissionIds') permissionIds: string[],
  ) {
    return this.roleService.removePermissions(id, permissionIds);
  }
}
