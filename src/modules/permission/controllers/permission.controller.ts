import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionWithIdDto } from '../dto/update-permission-with-id.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@ApiTags('权限管理')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('create')
  @Permissions('permission:create')
  @ApiOperation({ summary: '创建新权限' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get('list')
  @Permissions('permission:read')
  @ApiOperation({ summary: '获取所有权限列表' })
  findAll() {
    return this.permissionService.findAll();
  }

  @Get('detail')
  @Permissions('permission:read')
  @ApiOperation({ summary: '根据ID获取权限详情' })
  findOne(@Body('id') id: string) {
    return this.permissionService.findById(id);
  }

  @Post('update')
  @Permissions('permission:update')
  @ApiOperation({ summary: '更新权限信息' })
  update(@Body() updatePermissionWithIdDto: UpdatePermissionWithIdDto) {
    const { id, ...data } = updatePermissionWithIdDto;
    return this.permissionService.update(id, data as UpdatePermissionDto);
  }

  @Post('delete')
  @Permissions('permission:delete')
  @ApiOperation({ summary: '删除权限' })
  remove(@Body('id') id: string) {
    return this.permissionService.remove(id);
  }

  @Get('list-by-module')
  @Permissions('permission:read')
  @ApiOperation({ summary: '根据模块名获取权限列表' })
  findByModule(@Body('module') module: string) {
    return this.permissionService.findByModule(module);
  }
}
