import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleWithIdDto } from '../dto/update-role-with-id.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@ApiTags('角色管理')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('create')
  @Permissions('role:create')
  @ApiOperation({ summary: '创建新角色' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get('list')
  @Permissions('role:read')
  @ApiOperation({ summary: '获取所有角色列表' })
  findAll() {
    return this.roleService.findAll();
  }

  @Get('detail')
  @Permissions('role:read')
  @ApiOperation({ summary: '根据ID获取角色详情' })
  findOne(@Body('id') id: string) {
    return this.roleService.findById(id);
  }

  @Post('update')
  @Permissions('role:update')
  @ApiOperation({ summary: '更新角色信息' })
  update(@Body() updateRoleWithIdDto: UpdateRoleWithIdDto) {
    const { id, ...data } = updateRoleWithIdDto;
    return this.roleService.update(id, data as UpdateRoleDto);
  }

  @Post('delete')
  @Permissions('role:delete')
  @ApiOperation({ summary: '删除角色' })
  remove(@Body('id') id: string) {
    return this.roleService.remove(id);
  }

  @Post('add-permissions')
  @Permissions('role:update')
  @ApiOperation({ summary: '为角色添加权限' })
  addPermissions(
    @Body('id') id: string,
    @Body('permissionIds') permissionIds: string[],
  ) {
    return this.roleService.addPermissions(id, permissionIds);
  }

  @Post('remove-permissions')
  @Permissions('role:update')
  @ApiOperation({ summary: '从角色移除权限' })
  removePermissions(
    @Body('id') id: string,
    @Body('permissionIds') permissionIds: string[],
  ) {
    return this.roleService.removePermissions(id, permissionIds);
  }
}
