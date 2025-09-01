import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { Menu, MenuDocument } from '../entities/menu.entity';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { MenuTree } from '../types/menu.types';

@Injectable()
export class MenuService {
  constructor(@InjectModel(Menu.name) private menuModel: Model<MenuDocument>) {}

  async findAll(): Promise<any[]> {
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

  async findByRole(roleId: string): Promise<any[]> {
    // TODO: 实现根据角色ID获取菜单的逻辑
    // 这里需要与权限系统集成，暂时返回所有启用的菜单
    const menus = await this.menuModel
      .find({ status: 'active' })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean()
      .exec();

    const menuTree = this.buildMenuTree(menus);
    return menuTree.map((menu) => this.convertToResponseDto(menu));
  }

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    const menu = new this.menuModel(createMenuDto);
    return menu.save();
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

  private convertToResponseDto(menuTree: MenuTree): any {
    return {
      _id: menuTree._id.toString(),
      parentId: menuTree.parentId?.toString(),
      path: menuTree.path,
      name: menuTree.name,
      component: menuTree.component,
      redirect: menuTree.redirect,
      meta: {
        title: menuTree.metaTitle,
        icon: menuTree.metaIcon,
        hidden: menuTree.metaHidden,
        alwaysShow: menuTree.metaAlwaysShow,
      },
      sortOrder: menuTree.sortOrder,
      status: menuTree.status,
      createdAt: (menuTree as any).createdAt?.toISOString(),
      updatedAt: (menuTree as any).updatedAt?.toISOString(),
      children: menuTree.children?.map((child) =>
        this.convertToResponseDto(child),
      ),
    };
  }
}
