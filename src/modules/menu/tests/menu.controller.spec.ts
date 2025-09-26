import { Test, TestingModule } from '@nestjs/testing';
import { MenuController } from '../controllers/menu.controller';
import { MenuService } from '../services/menu.service';
import { RoleService } from '../../role/services/role.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import {
  MenuResponseDto,
  MenuListResponseDto,
  MenuDetailResponseDto,
} from '../dto/menu-response.dto';
import { Role } from '../../role/entities/role.entity';

describe('MenuController', () => {
  let menuController: MenuController;
  let menuService: jest.Mocked<MenuService>;
  let roleService: jest.Mocked<RoleService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
      providers: [
        {
          provide: MenuService,
          useValue: {
            findByRole: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: RoleService,
          useValue: {
            findByName: jest.fn(),
          },
        },
      ],
    }).compile();

    menuController = module.get<MenuController>(MenuController);
    menuService = module.get(MenuService);
    roleService = module.get(RoleService);
  });

  describe('getMenus', () => {
    it('应该根据角色名称成功获取菜单列表', async () => {
      // 安排
      const roleName = 'admin';
      const roleId = 'role123';
      const mockMenus: MenuResponseDto[] = [
        {
          id: '1',
          name: '首页',
          path: '/dashboard',
          meta: {
            title: '首页',
            icon: 'home',
            hidden: false,
            alwaysShow: false,
          },
          sortOrder: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: [],
        },
        {
          id: '2',
          name: '用户管理',
          path: '/users',
          meta: {
            title: '用户管理',
            icon: 'user',
            hidden: false,
            alwaysShow: false,
          },
          sortOrder: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: [],
        },
      ];

      roleService.findByName.mockResolvedValue({
        id: roleId,
        name: roleName,
        type: 'operator',
        description: '管理员角色',
        permissions: [],
        status: 'active',
        isSystem: true,
        users: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Role);
      menuService.findByRole.mockResolvedValue(mockMenus);

      // 执行
      const result = await menuController.getMenus(roleName);

      // 断言
      expect(result).toEqual({ data: mockMenus });
      expect(roleService.findByName).toHaveBeenCalledWith(roleName);
      expect(menuService.findByRole).toHaveBeenCalledWith(roleId);
    });

    it('应该在角色不存在时返回空菜单列表', async () => {
      // 安排
      const roleName = 'nonexistent';

      roleService.findByName.mockResolvedValue(null);

      // 执行
      const result = await menuController.getMenus(roleName);

      // 断言
      expect(result).toEqual({ data: [] });
      expect(roleService.findByName).toHaveBeenCalledWith(roleName);
      expect(menuService.findByRole).not.toHaveBeenCalled();
    });
  });

  describe('getMenusByRole', () => {
    it('应该根据角色ID成功获取菜单列表', async () => {
      // 安排
      const roleId = 'role123';
      const mockMenus: MenuResponseDto[] = [
        {
          id: '1',
          name: '首页',
          path: '/dashboard',
          meta: {
            title: '首页',
            icon: 'home',
            hidden: false,
            alwaysShow: false,
          },
          sortOrder: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: [],
        },
        {
          id: '2',
          name: '用户管理',
          path: '/users',
          meta: {
            title: '用户管理',
            icon: 'user',
            hidden: false,
            alwaysShow: false,
          },
          sortOrder: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: [],
        },
      ];

      menuService.findByRole.mockResolvedValue(mockMenus);

      // 执行
      const result = await menuController.getMenusByRole({ roleId });

      // 断言
      expect(result).toEqual({ data: mockMenus });
      expect(menuService.findByRole).toHaveBeenCalledWith(roleId);
    });
  });

  describe('getMenuDetail', () => {
    it('应该成功获取菜单详情', async () => {
      // 安排
      const menuId = 'menu123';
      const mockMenuResponse: MenuResponseDto = {
        id: menuId,
        name: '用户管理',
        path: '/users',
        meta: {
          title: '用户管理',
          icon: 'user',
          hidden: false,
          alwaysShow: false,
        },
        sortOrder: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        children: [],
      };

      // Mock the service to return the response DTO directly
      menuService.findOne.mockImplementation(async () => {
        // In real implementation, findOne returns a Menu entity which is then converted
        // For testing purposes, we'll mock the service to return the expected DTO
        return mockMenuResponse as any;
      });

      // 执行
      const result = await menuController.getMenuDetail({ id: menuId });

      // 断言
      expect(result).toEqual({ data: mockMenuResponse });
      expect(menuService.findOne).toHaveBeenCalledWith(menuId);
    });
  });

  describe('createMenu', () => {
    it('应该成功创建新菜单', async () => {
      // 安排
      const createMenuDto: CreateMenuDto = {
        name: '新菜单',
        path: '/new-menu',
        parentId: undefined,
      };
      const createdMenuResponse: MenuResponseDto = {
        id: 'menu123',
        name: '新菜单',
        path: '/new-menu',
        meta: {
          title: '新菜单',
          hidden: false,
          alwaysShow: false,
        },
        sortOrder: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        children: [],
      };

      // Mock the service to return the response DTO directly
      menuService.create.mockImplementation(async () => {
        // In real implementation, create returns a Menu entity which is then converted
        // For testing purposes, we'll mock the service to return the expected DTO
        return createdMenuResponse as any;
      });

      // 执行
      const result = await menuController.createMenu(createMenuDto);

      // 断言
      expect(result).toEqual({ data: createdMenuResponse });
      expect(menuService.create).toHaveBeenCalledWith(createMenuDto);
    });
  });

  describe('updateMenu', () => {
    it('应该成功更新菜单', async () => {
      // 安排
      const updateMenuDto: UpdateMenuDto = {
        id: 'menu123',
        name: '更新后的菜单',
        path: '/updated-menu',
      };
      const updatedMenuResponse: MenuResponseDto = {
        id: 'menu123',
        name: '更新后的菜单',
        path: '/updated-menu',
        meta: {
          title: '更新后的菜单',
          hidden: false,
          alwaysShow: false,
        },
        sortOrder: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        children: [],
      };

      // Mock the service to return the response DTO directly
      menuService.update.mockImplementation(async () => {
        // In real implementation, update returns a Menu entity which is then converted
        // For testing purposes, we'll mock the service to return the expected DTO
        return updatedMenuResponse as any;
      });

      // 执行
      const result = await menuController.updateMenu(updateMenuDto);

      // 断言
      expect(result).toEqual({ data: updatedMenuResponse });
      expect(menuService.update).toHaveBeenCalledWith(updateMenuDto);
    });
  });

  describe('deleteMenu', () => {
    it('应该成功删除菜单', async () => {
      // 安排
      const menuId = 'menu123';

      menuService.delete.mockResolvedValue();

      // 执行
      const result = await menuController.deleteMenu({ id: menuId });

      // 断言
      expect(result).toEqual({ message: '删除成功' });
      expect(menuService.delete).toHaveBeenCalledWith(menuId);
    });
  });
});
