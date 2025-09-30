import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../../common/guards/roles.guard';
import {
  Permissions,
  PERMISSIONS,
} from '../../../common/decorators/permissions.decorator';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleWithIdDto } from '../dto/update-role-with-id.dto';
import { Role } from '../entities/role.entity';
import { RoleListResponseDto } from '../dto/role-list-response.dto';

@ApiTags('角色管理')
@ApiTags('角色管理')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(PERMISSIONS.ROLE_CREATE)
  @ApiOperation({
    summary: '创建新角色',
    description: '创建新角色，角色类型一旦创建后不可修改',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '角色创建成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 201 },
        message: { type: 'string', example: '创建成功' },
        data: { $ref: '#/components/schemas/Role' },
      },
    },
  })
  create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.roleService.create(createRoleDto);
  }

  @Get('list')
  @Permissions(PERMISSIONS.ROLE_READ)
  @ApiOperation({ summary: '获取所有角色列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成功获取角色列表',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取成功' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/RoleListResponseDto' },
        },
      },
    },
  })
  findAll(): Promise<RoleListResponseDto[]> {
    return this.roleService.findAll();
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @Permissions(PERMISSIONS.ROLE_DELETE)
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
    status: HttpStatus.OK,
    description: '角色删除成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '删除成功' },
        data: { type: 'null' },
      },
    },
  })
  remove(@Body('id') id: string): Promise<void> {
    return this.roleService.remove(id);
  }

  @Post('update-permissions')
  @Permissions(PERMISSIONS.ROLE_UPDATE_PERMISSIONS)
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
    status: HttpStatus.OK,
    description: '角色权限更新成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '更新成功' },
        data: { $ref: '#/components/schemas/Role' },
      },
    },
  })
  updatePermissions(
    @Body('id') id: string,
    @Body('permissionIds') permissionIds: string[],
  ): Promise<Role> {
    return this.roleService.updatePermissions(id, permissionIds);
  }

  @Post('update')
  @Permissions(PERMISSIONS.ROLE_UPDATE)
  @ApiOperation({
    summary: '更新角色信息',
    description: '更新角色信息，角色名称和描述可修改，但角色类型不可修改',
  })
  @ApiBody({ type: UpdateRoleWithIdDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '角色更新成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '更新成功' },
        data: { $ref: '#/components/schemas/Role' },
      },
    },
  })
  update(@Body() updateRoleDto: UpdateRoleWithIdDto): Promise<Role> {
    return this.roleService.update(updateRoleDto.id, updateRoleDto);
  }

  @Get('permissions')
  @Permissions(PERMISSIONS.ROLE_PERMISSIONS)
  @ApiOperation({ summary: '获取角色权限列表（支持按类型筛选）' })
  @ApiQuery({ name: 'id', required: true, description: '角色ID' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: '权限类型筛选',
    enum: ['API', 'PAGE', 'OPERATION', 'DATA'],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成功获取角色权限',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取成功' },
        data: {
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
      },
    },
  })
  getPermissions(@Query('id') id: string, @Query('type') type?: string) {
    return this.roleService.findPermissionsByRoleId(id, type);
  }

  @Get('types')
  @Permissions(PERMISSIONS.ROLE_TYPES)
  @ApiOperation({
    summary: '获取所有角色类型',
    description: '获取系统中定义的所有角色类型枚举值，用于前端下拉选择',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成功获取角色类型列表',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取成功' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string', description: '角色类型值' },
              label: { type: 'string', description: '角色类型中文描述' },
            },
          },
        },
      },
    },
  })
  getRoleTypes() {
    return this.roleService.getRoleTypes();
  }
}
