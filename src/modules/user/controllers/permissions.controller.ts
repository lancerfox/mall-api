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
@ApiTags('权限管理')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@ApiBearerAuth()
export class PermissionsController {
  constructor() {}

  @Get()
  @ApiOperation({ summary: '获取所有权限列表' })
  @ApiResponse({
    status: 200,
    description: '获取权限列表成功',
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
