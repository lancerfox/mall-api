import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';
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
    type: [MenuResponseDto],
  })
  async getMenus(
    @CurrentUser('role') roleName: string,
  ): Promise<MenuResponseDto[]> {
    const role = await this.roleService.findByName(roleName);
    if (!role) {
      throw new BusinessException(ERROR_CODES.ROLE_NOT_FOUND);
    }
    return this.menuService.findByRole(role.id);
  }

  @Post('by-role')
  @ApiOperation({ summary: '根据角色获取菜单' })
  @ApiResponse({
    status: 200,
    description: '成功获取菜单列表',
    type: [MenuResponseDto],
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
    type: MenuResponseDto,
  })
  async getMenuDetail(
    @Body() body: MenuDetailRequestDto,
  ): Promise<MenuResponseDto> {
    return this.menuService.findOne(body.id);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建菜单' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '菜单创建成功',
    type: MenuResponseDto,
  })
  async createMenu(
    @Body() createMenuDto: CreateMenuDto,
  ): Promise<MenuResponseDto> {
    return this.menuService.create(createMenuDto);
  }

  @Post('update')
  @ApiOperation({ summary: '更新菜单' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '菜单更新成功',
    type: MenuResponseDto,
  })
  async updateMenu(
    @Body() updateMenuDto: UpdateMenuDto,
  ): Promise<MenuResponseDto> {
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
