import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import {
  Roles,
  ROLES,
  PERMISSIONS,
} from '../../../common/decorators/roles.decorator';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { Permission } from '../entities/permission.entity';

@ApiTags('权限管理')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('create')
  @Permissions('permission:create')
  @ApiOperation({ summary: '创建新权限' })
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({
    status: 201,
    description: 'The permission has been successfully created.',
    type: Permission,
  })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get('list')
  @Permissions('permission:read')
  @ApiOperation({ summary: '获取所有权限列表' })
  @ApiResponse({
    status: 200,
    description: 'A list of permissions.',
    type: [Permission],
  })
  findAll() {
    return this.permissionService.findAll();
  }

  @Post('delete')
  @Permissions('permission:delete')
  @ApiOperation({ summary: '删除权限' })
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
    description: 'The permission has been successfully deleted.',
  })
  remove(@Body('id') id: string) {
    return this.permissionService.remove(id);
  }

  @Get('predefined')
  @ApiOperation({ summary: '获取所有预定义权限列表' })
  @ApiResponse({
    status: 200,
    description: '获取预定义权限列表成功',
  })
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  getAllPermissions(): {
    permissions: string[];
    predefinedPermissions: Record<string, string>;
  } {
    // 去重并排序
    const uniquePermissions = [...new Set(Object.values(PERMISSIONS))].sort();

    return {
      permissions: uniquePermissions,
      predefinedPermissions: PERMISSIONS,
    };
  }
}
