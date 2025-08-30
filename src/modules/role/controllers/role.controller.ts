import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleWithIdDto } from '../dto/update-role-with-id.dto';
import { Role } from '../entities/role.entity';
import { RoleListResponseDto } from '../dto/role-list-response.dto';

@ApiTags('角色管理')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('create')
  @Permissions('role:create')
  @ApiOperation({
    summary: '创建新角色',
    description: '创建新角色，角色类型一旦创建后不可修改',
  })
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
    type: [RoleListResponseDto],
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

  @Post('update')
  @Permissions('role:update')
  @ApiOperation({
    summary: '更新角色信息',
    description: '更新角色信息，角色名称和描述可修改，但角色类型不可修改',
  })
  @ApiBody({ type: UpdateRoleWithIdDto })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully updated.',
    type: Role,
  })
  update(@Body() updateRoleDto: UpdateRoleWithIdDto) {
    return this.roleService.update(updateRoleDto.id, updateRoleDto);
  }

  @Get('permissions')
  @Permissions('role:read')
  @ApiOperation({ summary: '获取角色权限列表（支持按类型筛选）' })
  @ApiQuery({ name: 'id', required: true, description: '角色ID' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: '权限类型筛选',
    enum: ['API', 'PAGE', 'OPERATION', 'DATA'],
  })
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
          type: { type: 'string' },
        },
      },
    },
  })
  getPermissions(@Query('id') id: string, @Query('type') type?: string) {
    return this.roleService.findPermissionsByRoleId(id, type);
  }

  @Get('types')
  @Permissions('role:read')
  @ApiOperation({
    summary: '获取所有角色类型',
    description: '获取系统中定义的所有角色类型枚举值，用于前端下拉选择',
  })
  @ApiResponse({
    status: 200,
    description: '角色类型列表',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string', description: '角色类型值' },
          label: { type: 'string', description: '角色类型中文描述' },
        },
      },
    },
  })
  getRoleTypes() {
    return this.roleService.getRoleTypes();
  }
}
