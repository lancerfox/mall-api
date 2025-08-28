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
import { Roles } from '../../../common/decorators/roles.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @Permissions('permission:create')
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @Permissions('permission:read')
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @Permissions('permission:read')
  findOne(@Param('id') id: string) {
    return this.permissionService.findById(id);
  }

  @Patch(':id')
  @Permissions('permission:update')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @Permissions('permission:delete')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }

  @Get('module/:module')
  @Permissions('permission:read')
  findByModule(@Param('module') module: string) {
    return this.permissionService.findByModule(module);
  }
}
