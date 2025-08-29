import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { Role } from '../entities/role.entity';

@ApiTags('角色管理')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('create')
  @Permissions('role:create')
  @ApiOperation({ summary: '创建新角色' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 201,
    description: 'The role has been successfully created.',
    type: Role,
  })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get('list')
  @Permissions('role:read')
  @ApiOperation({ summary: '获取所有角色列表' })
  @ApiResponse({
    status: 200,
    description: 'A list of roles.',
    type: [Role],
  })
  findAll() {
    return this.roleService.findAll();
  }

  @Post('delete')
  @Permissions('role:delete')
  @ApiOperation({ summary: '删除角色' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully deleted.',
  })
  remove(@Body('id') id: string) {
    return this.roleService.remove(id);
  }

  @Post('update-permissions')
  @Permissions('role:update')
  @ApiOperation({ summary: '更新角色权限' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        permissionIds: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions have been successfully updated for the role.',
    type: Role,
  })
  updatePermissions(
    @Body('id') id: string,
    @Body('permissionIds') permissionIds: string[],
  ) {
    return this.roleService.updatePermissions(id, permissionIds);
  }

  @Get('permissions')
  @Permissions('role:read')
  @ApiOperation({ summary: '获取角色权限列表' })
  @ApiResponse({
    status: 200,
    description: 'The permissions of the role.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          code: { type: 'string' },
        },
      },
    },
  })
  getPermissions(@Query('id') id: string) {
    return this.roleService.findPermissionsByRoleId(id);
  }
}
