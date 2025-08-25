import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MenuService } from '../services/menu.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { MenuResponseDto, MenuTreeNodeDto } from '../dto/menu-response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import {
  Permissions,
  PERMISSIONS,
} from '../../../common/decorators/roles.decorator';
import { MongoIdValidationPipe } from '../../../common/pipes/mongo-id-validation.pipe';

@ApiTags('菜单管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiOperation({ summary: '创建菜单' })
  @ApiResponse({
    status: 201,
    description: '菜单创建成功',
    type: MenuResponseDto,
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @Permissions(PERMISSIONS.MENU_CREATE)
  async create(@Body() createMenuDto: CreateMenuDto): Promise<MenuResponseDto> {
    return this.menuService.create(createMenuDto);
  }

  @Get()
  @ApiOperation({ summary: '获取菜单列表' })
  @ApiResponse({
    status: 200,
    description: '获取菜单列表成功',
    type: [MenuResponseDto],
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @Permissions(PERMISSIONS.MENU_READ)
  async findAll(): Promise<MenuResponseDto[]> {
    return this.menuService.findAll();
  }

  @Get('tree')
  @ApiOperation({ summary: '获取菜单树形结构' })
  @ApiResponse({
    status: 200,
    description: '获取菜单树形结构成功',
    type: [MenuTreeNodeDto],
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @Permissions(PERMISSIONS.MENU_READ)
  async findTree(): Promise<MenuTreeNodeDto[]> {
    return this.menuService.findTree();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取菜单详情' })
  @ApiResponse({
    status: 200,
    description: '获取菜单详情成功',
    type: MenuResponseDto,
  })
  @ApiResponse({ status: 400, description: '无效的菜单ID' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  @Permissions(PERMISSIONS.MENU_READ)
  async findOne(
    @Param('id', MongoIdValidationPipe) id: string,
  ): Promise<MenuResponseDto> {
    return this.menuService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新菜单' })
  @ApiResponse({
    status: 200,
    description: '菜单更新成功',
    type: MenuResponseDto,
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  @Permissions(PERMISSIONS.MENU_UPDATE)
  async update(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ): Promise<MenuResponseDto> {
    return this.menuService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除菜单' })
  @ApiResponse({ status: 204, description: '菜单删除成功' })
  @ApiResponse({ status: 400, description: '无效的菜单ID或存在子菜单' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  @Permissions(PERMISSIONS.MENU_DELETE)
  async remove(@Param('id', MongoIdValidationPipe) id: string): Promise<void> {
    return this.menuService.remove(id);
  }

  @Put('sort')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '菜单排序' })
  @ApiResponse({ status: 204, description: '菜单排序成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @Permissions(PERMISSIONS.MENU_SORT)
  async sortMenus(
    @Body() sortData: { id: string; sort: number }[],
  ): Promise<void> {
    return this.menuService.sortMenus(sortData);
  }
}
