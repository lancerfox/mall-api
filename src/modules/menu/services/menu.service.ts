import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Menu, MenuDocument } from '../entities/menu.entity';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { MenuResponseDto, MenuTreeNodeDto } from '../dto/menu-response.dto';

// Represents the plain JS object from toObject(), including virtuals
interface MenuObject extends Menu {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  children?: MenuObject[]; // The children are also plain objects
}

@Injectable()
export class MenuService {
  constructor(@InjectModel(Menu.name) private menuModel: Model<MenuDocument>) {}

  /**
   * 创建菜单
   */
  async create(createMenuDto: CreateMenuDto): Promise<MenuResponseDto> {
    // 验证父菜单是否存在
    if (createMenuDto.parentId) {
      const parentMenu = await this.menuModel.findById(createMenuDto.parentId);
      if (!parentMenu) {
        throw new BadRequestException('父菜单不存在');
      }
    }

    // 检查菜单名称是否已存在
    const existingMenu = await this.menuModel.findOne({
      name: createMenuDto.name,
    });
    if (existingMenu) {
      throw new BadRequestException('菜单名称已存在');
    }

    // 如果没有指定排序，设置为最大值+1
    if (createMenuDto.sort === undefined) {
      const maxSortMenu = await this.menuModel
        .findOne({ parentId: createMenuDto.parentId || null })
        .sort({ sort: -1 });
      createMenuDto.sort = maxSortMenu ? maxSortMenu.sort + 1 : 1;
    }

    const createdMenu = new this.menuModel(createMenuDto);
    const savedMenu = await createdMenu.save();
    return this.transformToResponseDto(savedMenu);
  }

  /**
   * 获取所有菜单列表
   */
  async findAll(): Promise<MenuResponseDto[]> {
    const menus = await this.menuModel
      .find()
      .sort({ sort: 1 })
      .populate('children')
      .exec();

    return menus.map((menu) => this.transformToResponseDto(menu));
  }

  /**
   * 获取菜单树形结构
   */
  async findTree(): Promise<MenuTreeNodeDto[]> {
    const menus = await this.menuModel
      .find({ status: 'active' })
      .sort({ sort: 1 })
      .exec();

    return this.buildMenuTree(menus);
  }

  /**
   * 根据ID获取单个菜单
   */
  async findOne(id: string): Promise<MenuResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('无效的菜单ID');
    }

    const menu = await this.menuModel.findById(id).populate('children').exec();
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    return this.transformToResponseDto(menu);
  }

  /**
   * 更新菜单
   */
  async update(
    id: string,
    updateMenuDto: UpdateMenuDto,
  ): Promise<MenuResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('无效的菜单ID');
    }

    // 验证菜单是否存在
    const existingMenu = await this.menuModel.findById(id);
    if (!existingMenu) {
      throw new NotFoundException('菜单不存在');
    }

    // 验证父菜单是否存在（如果指定了父菜单）
    if (updateMenuDto.parentId) {
      if (updateMenuDto.parentId === id) {
        throw new BadRequestException('不能将自己设置为父菜单');
      }

      const parentMenu = await this.menuModel.findById(updateMenuDto.parentId);
      if (!parentMenu) {
        throw new BadRequestException('父菜单不存在');
      }

      // 检查是否会形成循环引用
      if (await this.wouldCreateCircularReference(id, updateMenuDto.parentId)) {
        throw new BadRequestException('不能将子菜单设置为父菜单');
      }
    }

    // 检查菜单名称是否已存在（排除自己）
    if (updateMenuDto.name && updateMenuDto.name !== existingMenu.name) {
      const duplicateMenu = await this.menuModel.findOne({
        name: updateMenuDto.name,
        _id: { $ne: id },
      });
      if (duplicateMenu) {
        throw new BadRequestException('菜单名称已存在');
      }
    }

    const updatedMenu = await this.menuModel
      .findByIdAndUpdate(id, updateMenuDto, { new: true })
      .populate('children')
      .exec();

    if (!updatedMenu) {
      throw new NotFoundException('菜单不存在');
    }

    return this.transformToResponseDto(updatedMenu);
  }

  /**
   * 删除菜单
   */
  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('无效的菜单ID');
    }

    const menu = await this.menuModel.findById(id);
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    // 检查是否有子菜单
    const childrenCount = await this.menuModel.countDocuments({ parentId: id });
    if (childrenCount > 0) {
      throw new BadRequestException('存在子菜单，无法删除');
    }

    await this.menuModel.findByIdAndDelete(id);
  }

  /**
   * 菜单排序
   */
  async sortMenus(sortData: { id: string; sort: number }[]): Promise<void> {
    const bulkOps = sortData.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { sort: item.sort },
      },
    }));

    await this.menuModel.bulkWrite(bulkOps);
  }

  /**
   * 构建菜单树形结构
   */
  private buildMenuTree(
    menus: MenuDocument[],
    parentId: string | null = null,
  ): MenuTreeNodeDto[] {
    const tree: MenuTreeNodeDto[] = [];

    for (const menu of menus) {
      const menuParentId = menu.parentId ? menu.parentId.toString() : null;

      if (menuParentId === parentId) {
        const node: MenuTreeNodeDto = {
          id: (menu._id as Types.ObjectId).toString(),
          title: menu.title,
          name: menu.name,
          path: menu.path,
          icon: menu.icon,
          sort: menu.sort,
          type: menu.type,
          status: menu.status,
          children: this.buildMenuTree(
            menus,
            (menu._id as Types.ObjectId).toString(),
          ),
        };

        tree.push(node);
      }
    }

    return tree.sort((a, b) => a.sort - b.sort);
  }

  /**
   * 检查是否会形成循环引用
   */
  private async wouldCreateCircularReference(
    menuId: string,
    parentId: string,
  ): Promise<boolean> {
    let currentParentId: string | null = parentId;

    while (currentParentId) {
      if (currentParentId === menuId) {
        return true;
      }

      const parentMenu: MenuDocument | null =
        await this.menuModel.findById(currentParentId);
      if (!parentMenu) {
        break;
      }

      currentParentId = parentMenu.parentId
        ? parentMenu.parentId.toString()
        : null;
    }

    return false;
  }

  /**
   * 根据用户权限获取菜单树
   */
  async findUserMenuTree(
    userRole: string,
    userPermissions: string[],
  ): Promise<MenuTreeNodeDto[]> {
    // 获取所有激活的菜单
    const menus = await this.menuModel
      .find({ status: 'active' })
      .sort({ sort: 1 })
      .exec();

    // 过滤用户有权限访问的菜单
    const accessibleMenus = menus.filter((menu) => {
      // 超级管理员可以访问所有菜单
      if (userRole === 'super_admin') {
        return true;
      }

      // 如果菜单没有设置权限要求，则所有用户都可以访问
      if (!menu.permission) {
        return true;
      }

      // 检查用户是否有该菜单的权限
      return userPermissions.includes(menu.permission);
    });

    return this.buildMenuTree(accessibleMenus);
  }

  /**
   * 获取所有可用权限列表
   */
  async getAllPermissions(): Promise<string[]> {
    const menus = await this.menuModel
      .find({ permission: { $exists: true, $ne: null } })
      .select('permission')
      .exec();

    const permissions = menus
      .map((menu) => menu.permission)
      .filter((permission): permission is string => Boolean(permission));

    // 去重并排序
    return [...new Set(permissions)].sort();
  }

  /**
   * 转换为响应DTO
   */
  private transformToResponseDto(menu: MenuDocument): MenuResponseDto {
    // This helper function works with plain objects, making recursion safe.
    const transform = (menuObj: MenuObject): MenuResponseDto => {
      return {
        _id: menuObj._id.toString(),
        title: menuObj.title,
        name: menuObj.name,
        path: menuObj.path,
        component: menuObj.component,
        icon: menuObj.icon,
        parentId: menuObj.parentId ? menuObj.parentId.toString() : undefined,
        sort: menuObj.sort,
        type: menuObj.type,
        status: menuObj.status,
        permission: menuObj.permission,
        hidden: menuObj.hidden,
        keepAlive: menuObj.keepAlive,
        redirect: menuObj.redirect,
        meta: menuObj.meta,
        children: menuObj.children?.map(transform), // Safe recursive call
        createdAt: menuObj.createdAt,
        updatedAt: menuObj.updatedAt,
      };
    };

    const menuObj = menu.toObject({ virtuals: true }) as MenuObject;
    return transform(menuObj);
  }
}
