import { Test, TestingModule } from '@nestjs/testing';
import { MenuController } from '../controllers/menu.controller';
import { MenuService } from '../services/menu.service';
import { RoleService } from '../../role/services/role.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { MenuByRoleRequestDto } from '../dto/menu-response.dto';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';

describe('MenuController', () => {
  let controller: MenuController;
  let menuService: MenuService;
  let roleService: RoleService;

  const mockRole = {
    id: 'role1',
    name: 'admin',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
      providers: [
        {
          provide: MenuService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByRole: jest.fn(),
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

    controller = module.get<MenuController>(MenuController);
    menuService = module.get<MenuService>(MenuService);
    roleService = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMenus', () => {
    it('should call menuService.findByRole with role ID', async () => {
      const roleName = 'admin';
      const mockMenus = [{ id: '1', name: 'Test Menu' }];

      (roleService.findByName as jest.Mock).mockResolvedValue(mockRole);
      (menuService.findByRole as jest.Mock).mockResolvedValue(mockMenus);

      const result = await controller.getMenus(roleName);

      expect(roleService.findByName).toHaveBeenCalledWith(roleName);
      expect(menuService.findByRole).toHaveBeenCalledWith(mockRole.id);
      expect(result).toEqual(mockMenus);
    });

    it('should throw ROLE_NOT_FOUND error if role does not exist', async () => {
      (roleService.findByName as jest.Mock).mockResolvedValue(null);

      await expect(controller.getMenus('nonexistent')).rejects.toThrow(
        new BusinessException(ERROR_CODES.ROLE_NOT_FOUND),
      );
    });
  });

  describe('getMenusByRole', () => {
    it('should call menuService.findByRole', async () => {
      const body: MenuByRoleRequestDto = { roleId: 'role1' };
      const mockMenus = [{ id: '1', name: 'Test Menu' }];

      (menuService.findByRole as jest.Mock).mockResolvedValue(mockMenus);

      const result = await controller.getMenusByRole(body);

      expect(menuService.findByRole).toHaveBeenCalledWith(body.roleId);
      expect(result).toEqual(mockMenus);
    });
  });

  describe('getMenuDetail', () => {
    it('should call menuService.findOne', async () => {
      const body = { id: '1' };
      const mockMenu = { id: '1', name: 'Test Menu' };

      (menuService.findOne as jest.Mock).mockResolvedValue(mockMenu);

      const result = await controller.getMenuDetail(body);

      expect(menuService.findOne).toHaveBeenCalledWith(body.id);
      expect(result).toEqual(mockMenu);
    });
  });

  describe('createMenu', () => {
    it('should call menuService.create', async () => {
      const createMenuDto: CreateMenuDto = {
        name: 'New Menu',
        path: '/new-menu',
        status: 'active',
      };
      const mockMenu = {
        id: '2',
        name: 'New Menu',
        path: '/new-menu',
        status: 'active',
      };

      (menuService.create as jest.Mock).mockResolvedValue(mockMenu);

      const result = await controller.createMenu(createMenuDto);

      expect(menuService.create).toHaveBeenCalledWith(createMenuDto);
      expect(result).toEqual(mockMenu);
    });
  });

  describe('updateMenu', () => {
    it('should call menuService.update', async () => {
      const updateMenuDto: UpdateMenuDto = {
        id: '1',
        name: 'Updated Menu',
        status: 'active',
      };
      const mockMenu = { id: '1', name: 'Updated Menu', status: 'active' };

      (menuService.update as jest.Mock).mockResolvedValue(mockMenu);

      const result = await controller.updateMenu(updateMenuDto);

      expect(menuService.update).toHaveBeenCalledWith(updateMenuDto);
      expect(result).toEqual(mockMenu);
    });
  });

  describe('deleteMenu', () => {
    it('should call menuService.delete', async () => {
      const body = { id: '1' };

      (menuService.delete as jest.Mock).mockResolvedValue(undefined);

      await controller.deleteMenu(body);

      expect(menuService.delete).toHaveBeenCalledWith(body.id);
    });
  });
});
