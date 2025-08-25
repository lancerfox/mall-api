import { Test, TestingModule } from '@nestjs/testing';
import { MenuController } from '../controllers/menu.controller';
import { MenuService } from '../services/menu.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';

describe('MenuController', () => {
  let controller: MenuController;
  let menuService: MenuService;

  const mockMenuService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findTree: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    sortMenus: jest.fn(),
  };

  const mockMenu = {
    id: '507f1f77bcf86cd799439011',
    title: 'Test Menu',
    name: 'TestMenu',
    path: '/test',
    component: 'test/index',
    icon: 'test',
    parentId: null,
    sort: 1,
    type: 'menu',
    status: 'active',
    permission: 'test:menu',
    hidden: false,
    keepAlive: true,
    redirect: null,
    meta: {
      title: 'Test Menu',
      icon: 'test',
      noCache: false,
      breadcrumb: true,
      affix: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
      providers: [
        {
          provide: MenuService,
          useValue: mockMenuService,
        },
      ],
    }).compile();

    controller = module.get<MenuController>(MenuController);
    menuService = module.get<MenuService>(MenuService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a menu successfully', async () => {
      const createMenuDto: CreateMenuDto = {
        title: 'Test Menu',
        name: 'TestMenu',
        path: '/test',
        component: 'test/index',
        icon: 'test',
        type: 'menu',
        sort: 1,
      };

      mockMenuService.create.mockResolvedValue(mockMenu);

      const result = await controller.create(createMenuDto);

      expect(result).toBeDefined();
      expect(result.title).toBe(mockMenu.title);
      expect(mockMenuService.create).toHaveBeenCalledWith(createMenuDto);
    });
  });

  describe('findAll', () => {
    it('should return all menus', async () => {
      const mockMenus = [mockMenu];
      mockMenuService.findAll.mockResolvedValue(mockMenus);

      const result = await controller.findAll();

      expect(result).toBeDefined();
      expect(result).toEqual(mockMenus);
      expect(mockMenuService.findAll).toHaveBeenCalled();
    });
  });

  describe('findTree', () => {
    it('should return menu tree structure', async () => {
      const mockMenuTree = [
        {
          ...mockMenu,
          children: [],
        },
      ];
      mockMenuService.findTree.mockResolvedValue(mockMenuTree);

      const result = await controller.findTree();

      expect(result).toBeDefined();
      expect(result).toEqual(mockMenuTree);
      expect(mockMenuService.findTree).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a menu by id', async () => {
      const menuId = '507f1f77bcf86cd799439011';

      mockMenuService.findOne.mockResolvedValue(mockMenu);

      const result = await controller.findOne(menuId);

      expect(result).toBeDefined();
      expect(result.title).toBe(mockMenu.title);
      expect(mockMenuService.findOne).toHaveBeenCalledWith(menuId);
    });
  });

  describe('update', () => {
    it('should update a menu successfully', async () => {
      const menuId = '507f1f77bcf86cd799439011';
      const updateMenuDto: UpdateMenuDto = {
        title: 'Updated Menu',
      };

      const updatedMenu = { ...mockMenu, ...updateMenuDto };
      mockMenuService.update.mockResolvedValue(updatedMenu);

      const result = await controller.update(menuId, updateMenuDto);

      expect(result).toBeDefined();
      expect(result.title).toBe(updateMenuDto.title);
      expect(mockMenuService.update).toHaveBeenCalledWith(
        menuId,
        updateMenuDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a menu successfully', async () => {
      const menuId = '507f1f77bcf86cd799439011';

      mockMenuService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(menuId);

      expect(result).toBeDefined();
      expect(result.message).toBe('菜单删除成功');
      expect(mockMenuService.remove).toHaveBeenCalledWith(menuId);
    });
  });

  describe('sortMenus', () => {
    it('should sort menus successfully', async () => {
      const sortData = [
        { id: '507f1f77bcf86cd799439011', sort: 1 },
        { id: '507f1f77bcf86cd799439012', sort: 2 },
      ];

      mockMenuService.sortMenus.mockResolvedValue(undefined);

      const result = await controller.sortMenus({ sortData });

      expect(result).toBeDefined();
      expect(result.message).toBe('菜单排序成功');
      expect(mockMenuService.sortMenus).toHaveBeenCalledWith(sortData);
    });
  });
});
