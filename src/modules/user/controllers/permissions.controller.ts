import {
  Controller,
  Get,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import {
  Roles,
  ROLES,
  PERMISSIONS,
} from '../../../common/decorators/roles.decorator';
import { MenuService } from '../../menu/services/menu.service';

@ApiTags('权限管理')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: '获取所有权限列表' })
  @ApiResponse({
    status: 200,
    description: '获取权限列表成功',
  })
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  async getAllPermissions(): Promise<{
    permissions: string[];
    predefinedPermissions: typeof PERMISSIONS;
  }> {
    const menuPermissions = await this.menuService.getAllPermissions();

    // 合并菜单权限和预定义权限
    const allPermissions = [...menuPermissions, ...Object.values(PERMISSIONS)];

    // 去重并排序
    const uniquePermissions = [...new Set(allPermissions)].sort();

    return {
      permissions: uniquePermissions,
      predefinedPermissions: PERMISSIONS,
    };
  }

  @Get('roles')
  @ApiOperation({ summary: '获取所有角色列表' })
  @ApiResponse({
    status: 200,
    description: '获取角色列表成功',
  })
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  getAllRoles(): {
    roles: typeof ROLES;
    roleDescriptions: Record<string, string>;
  } {
    const roleDescriptions = {
      [ROLES.SUPER_ADMIN]: '超级管理员 - 拥有所有权限',
      [ROLES.ADMIN]: '管理员 - 拥有大部分管理权限',
      [ROLES.OPERATOR]: '操作员 - 拥有基本操作权限',
    };

    return {
      roles: ROLES,
      roleDescriptions,
    };
  }
}
