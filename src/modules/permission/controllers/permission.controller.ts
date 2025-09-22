import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../../common/guards/roles.guard';
import {
  Permissions,
  PERMISSIONS,
} from '../../../common/decorators/permissions.decorator';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionWithIdDto } from '../dto/update-permission-with-id.dto';
import { Permission } from '../entities/permission.entity';

@ApiTags('权限管理')
@Controller('permissions')
@UseGuards(
  JwtAuthGuard,
  // RolesGuard
)
@UsePipes(new ValidationPipe({ transform: true }))
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('create')
  @Permissions(PERMISSIONS.PERMISSION_CREATE)
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
  @Permissions(PERMISSIONS.PERMISSION_READ)
  @ApiOperation({ summary: '获取权限列表' })
  @ApiResponse({
    status: 200,
    description: 'A list of permissions.',
    type: [Permission],
  })
  findAll(@Query('type') type?: string) {
    // 如果提供了type参数，则按类型过滤权限
    if (type) {
      return this.permissionService.findByType(type);
    }
    return this.permissionService.findAll();
  }

  @Post('delete')
  @Permissions(PERMISSIONS.PERMISSION_DELETE)
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

  @Post('update')
  @Permissions(PERMISSIONS.PERMISSION_UPDATE)
  @ApiOperation({ summary: '更新权限信息' })
  @ApiBody({ type: UpdatePermissionWithIdDto })
  @ApiResponse({
    status: 200,
    description: 'The permission has been successfully updated.',
    type: Permission,
  })
  update(@Body() updatePermissionDto: UpdatePermissionWithIdDto) {
    const { id, ...updateData } = updatePermissionDto;
    return this.permissionService.update(id, updateData);
  }
}
