import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MenuService } from '../services/menu.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import {
  MenuListResponseDto,
  MenuDetailResponseDto,
  DeleteMenuRequestDto,
  MenuDetailRequestDto,
  MenuByRoleRequestDto,
} from '../dto/menu-response.dto';

@ApiTags('菜单管理')
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: '获取菜单列表' })
  @ApiResponse({ status: 200, type: MenuListResponseDto })
  async getMenus(): Promise<MenuListResponseDto> {
    const data = await this.menuService.findAll();
    return { data };
  }

  @Post('by-role')
  @ApiOperation({ summary: '根据角色获取菜单' })
  @ApiResponse({ status: 200, type: MenuListResponseDto })
  async getMenusByRole(
    @Body() body: MenuByRoleRequestDto,
  ): Promise<MenuListResponseDto> {
    const data = await this.menuService.findByRole(body.roleId);
    return { data };
  }

  @Post('detail')
  @ApiOperation({ summary: '获取菜单详情' })
  @ApiResponse({ status: 200, type: MenuDetailResponseDto })
  async getMenuDetail(@Body() body: MenuDetailRequestDto) {
    const data = await this.menuService.findOne(body.id);
    return { data };
  }

  @Post('create')
  @ApiOperation({ summary: '创建菜单' })
  @ApiResponse({ status: 201, type: MenuDetailResponseDto })
  async createMenu(@Body() createMenuDto: CreateMenuDto) {
    const data = await this.menuService.create(createMenuDto);
    return { data };
  }

  @Post('update')
  @ApiOperation({ summary: '更新菜单' })
  @ApiResponse({ status: 200, type: MenuDetailResponseDto })
  async updateMenu(@Body() updateMenuDto: UpdateMenuDto) {
    const data = await this.menuService.update(updateMenuDto);
    return { data };
  }

  @Post('delete')
  @ApiOperation({ summary: '删除菜单' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteMenu(@Body() body: DeleteMenuRequestDto) {
    await this.menuService.delete(body.id);
    return { message: '删除成功' };
  }
}
