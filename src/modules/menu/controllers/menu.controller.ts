import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MenuService } from '../services/menu.service';
import { RoleService } from '../../role/services/role.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import {
  MenuResponseDto,
  DeleteMenuRequestDto,
  MenuDetailRequestDto,
  MenuByRoleRequestDto,
} from '../dto/menu-response.dto';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { Menu } from '../entities/menu.entity';

@ApiTags('菜单管理')
@Controller('menus')
@ApiBearerAuth()
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly roleService: RoleService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取当前用户菜单列表' })
  @ApiResponse({
    status: 200,
    description: '成功获取菜单列表',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取成功' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/MenuResponseDto' },
        },
      },
    },
  })
  async getMenus(
    @CurrentUser('role') roleName: string,
  ): Promise<MenuResponseDto[]> {
    const role = await this.roleService.findByName(roleName);
    if (!role) {
      throw new NotFoundException('当前用户角色不存在');
    }
    return this.menuService.findByRole(role.id);
  }

  @Post('by-role')
  @ApiOperation({ summary: '根据角色获取菜单' })
  @ApiResponse({
    status: 200,
    description: '成功获取菜单列表',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取成功' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/MenuResponseDto' },
        },
      },
    },
  })
  async getMenusByRole(
    @Body() body: MenuByRoleRequestDto,
  ): Promise<MenuResponseDto[]> {
    return this.menuService.findByRole(body.roleId);
  }

  @Post('detail')
  @ApiOperation({ summary: '获取菜单详情' })
  @ApiResponse({
    status: 200,
    description: '成功获取菜单详情',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取成功' },
        data: { $ref: '#/components/schemas/Menu' },
      },
    },
  })
  async getMenuDetail(@Body() body: MenuDetailRequestDto): Promise<Menu> {
    return this.menuService.findOne(body.id);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建菜单' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '菜单创建成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 201 },
        message: { type: 'string', example: '创建成功' },
        data: { $ref: '#/components/schemas/Menu' },
      },
    },
  })
  async createMenu(@Body() createMenuDto: CreateMenuDto): Promise<Menu> {
    return this.menuService.create(createMenuDto);
  }

  @Post('update')
  @ApiOperation({ summary: '更新菜单' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '菜单更新成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '更新成功' },
        data: { $ref: '#/components/schemas/Menu' },
      },
    },
  })
  async updateMenu(@Body() updateMenuDto: UpdateMenuDto): Promise<Menu> {
    return this.menuService.update(updateMenuDto);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除菜单' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '删除成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '删除成功' },
        data: { type: 'null' },
      },
    },
  })
  async deleteMenu(@Body() body: DeleteMenuRequestDto): Promise<void> {
    await this.menuService.delete(body.id);
  }
}
