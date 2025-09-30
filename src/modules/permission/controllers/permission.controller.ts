import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
  HttpCode,
  HttpStatus,
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
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(PERMISSIONS.PERMISSION_CREATE)
  @ApiOperation({ summary: '创建新权限' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '权限创建成功',
    type: Permission,
  })
  create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    return this.permissionService.create(createPermissionDto);
  }

  @Get('list')
  @Permissions(PERMISSIONS.PERMISSION_READ)
  @ApiOperation({ summary: '获取权限列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成功获取权限列表',
    type: [Permission],
  })
  findAll(@Query('type') type?: string): Promise<Permission[]> {
    if (type) {
      return this.permissionService.findByType(type);
    }
    return this.permissionService.findAll();
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
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
    status: HttpStatus.OK,
    description: '权限删除成功',
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
    return this.permissionService.remove(id);
  }

  @Post('update')
  @Permissions(PERMISSIONS.PERMISSION_UPDATE)
  @ApiOperation({ summary: '更新权限信息' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '权限更新成功',
    type: Permission,
  })
  update(
    @Body() updatePermissionDto: UpdatePermissionWithIdDto,
  ): Promise<Permission> {
    const { id, ...updateData } = updatePermissionDto;
    return this.permissionService.update(id, updateData);
  }
}
