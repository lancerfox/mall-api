import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { Menu, MenuDocument } from '../entities/menu.entity';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { MenuTree } from '../types/menu.types';
import { MenuResponseDto } from '../dto/menu-response.dto';

@Injectable()
export class MenuService {
  constructor(@InjectModel(Menu.name) private menuModel: Model<MenuDocument>) {}

  async findAll(): Promise<MenuResponseDto[]> {
    const menus = await this.menuModel
      .find()
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean()
      .exec();

    const menuTree = this.buildMenuTree(menus);
    return menuTree.map((menu) => this.convertToResponseDto(menu));
  }

  async findOne(id: string): Promise<Menu> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('无效的菜单ID');
    }

    const menu = await this.menuModel.findById(id).lean().exec();
    if (!menu) {
      throw new NotFoundException(`菜单 ${id} 不存在`);
    }
    return menu;
  }

  async findByRole(_roleId: string): Promise<MenuResponseDto[]> {
    // TODO: 实现根据角色ID获取菜单的逻辑
    // 这里需要与权限系统集成，暂时返回所有启用的菜单
    // roleId 参数已接收但暂未使用，添加下划线前缀表示未使用
    console.log('_roleId', _roleId);
    const menus = await this.menuModel
      .find({ status: 'active' })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean()
      .exec();

    const menuTree = this.buildMenuTree(menus);
    return menuTree.map((menu) => this.convertToResponseDto(menu));
  }

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    return this.menuModel.create(createMenuDto);
  }

  async update(updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const { id, ...updateData } = updateMenuDto;

    const menu = await this.menuModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .lean()
      .exec();

    if (!menu) {
      throw new NotFoundException(`菜单 ${id} 不存在`);
    }

    return menu;
  }

  async delete(id: string): Promise<void> {
    const result = await this.menuModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`菜单 ${id} 不存在`);
    }
  }

  private buildMenuTree(menus: Menu[]): MenuTree[] {
    const menuMap = new Map<string, MenuTree>();
    const rootMenus: MenuTree[] = [];

    // 创建菜单映射
    menus.forEach((menu) => {
      menuMap.set(menu._id.toString(), { ...menu, children: [] });
    });

    // 构建树形结构
    menus.forEach((menu) => {
      const menuObj = menuMap.get(menu._id.toString());
      if (!menuObj) return;

      if (menu.parentId) {
        const parentId = menu.parentId.toString();
        const parent = menuMap.get(parentId);
        if (parent) {
          parent.children.push(menuObj);
        }
      } else {
        rootMenus.push(menuObj);
      }
    });

    return rootMenus.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  private convertToResponseDto(menuTree: MenuTree): MenuResponseDto {
    return {
      id: menuTree._id.toString(),
      parentId: menuTree.parentId ? menuTree.parentId.toString() : undefined,
      path: menuTree.path || '',
      name: menuTree.name || '',
      component: menuTree.component || '',
      redirect: menuTree.redirect ? menuTree.redirect : undefined,
      meta: {
        title: menuTree.metaTitle || '',
        icon: menuTree.metaIcon || '',
        hidden: menuTree.metaHidden || false,
        alwaysShow: menuTree.metaAlwaysShow || false,
      },
      sortOrder: menuTree.sortOrder || 0,
      status: menuTree.status || 'active',
      createdAt: menuTree.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: menuTree.updatedAt?.toISOString() || new Date().toISOString(),
      children:
        menuTree.children?.map((child) => this.convertToResponseDto(child)) ||
        [],
    };
  }
}
