import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MenuService } from '../services/menu.service';
import { Menu } from '../entities/menu.entity';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { NotFoundException } from '@nestjs/common';

describe('MenuService', () => {
  let service: MenuService;
  let menuModel: Model<Menu>;

  const mockMenuModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
  };

  const mockMenu = {
    _id: new Types.ObjectId(),
    path: '/system',
    name: 'System',
    component: 'views/System/index',
    metaTitle: '系统管理',
    metaIcon: 'carbon:settings',
    metaHidden: false,
    metaAlwaysShow: false,
    sortOrder: 0,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMenuWithParent = {
    ...mockMenu,
    parentId: new Types.ObjectId(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: getModelToken(Menu.name),
          useValue: mockMenuModel,
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    menuModel = module.get<Model<Menu>>(getModelToken(Menu.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('应该返回菜单树形结构', async () => {
      const mockMenus = [mockMenu, mockMenuWithParent];
      mockMenuModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockMenus),
          }),
        }),
      });

      const result = await service.findAll();

      expect(mockMenuModel.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('children');
    });

    it('应该处理空菜单列表', async () => {
      mockMenuModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('应该通过ID找到菜单', async () => {
      const menuId = mockMenu._id.toString();
      mockMenuModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockMenu),
        }),
      });

      const result = await service.findOne(menuId);

      expect(mockMenuModel.findById).toHaveBeenCalledWith(menuId);
      expect(result).toEqual(mockMenu);
    });

    it('应该对无效ID抛出NotFoundException', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('应该对不存在的菜单抛出NotFoundException', async () => {
      const menuId = new Types.ObjectId().toString();
      mockMenuModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.findOne(menuId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByRole', () => {
    it('应该返回角色相关的菜单', async () => {
      mockMenuModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([mockMenu]),
          }),
        }),
      });

      const result = await service.findByRole('role-id');

      expect(mockMenuModel.find).toHaveBeenCalledWith({ status: 'active' });
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('应该创建新菜单', async () => {
      const createMenuDto: CreateMenuDto = {
        path: '/system',
        name: 'System',
        component: 'views/System/index',
        metaTitle: '系统管理',
        metaIcon: 'carbon:settings',
        metaHidden: false,
        metaAlwaysShow: false,
        sortOrder: 0,
      };

      mockMenuModel.create.mockResolvedValue(mockMenu);

      const result = await service.create(createMenuDto);

      expect(mockMenuModel.create).toHaveBeenCalledWith(createMenuDto);
      expect(result).toEqual(mockMenu);
    });
  });

  describe('update', () => {
    it('应该更新菜单', async () => {
      const updateMenuDto: UpdateMenuDto = {
        id: mockMenu._id.toString(),
        name: 'Updated System',
      };

      const updatedMenu = { ...mockMenu, name: 'Updated System' };
      mockMenuModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedMenu),
        }),
      });

      const result = await service.update(updateMenuDto);

      expect(mockMenuModel.findByIdAndUpdate).toHaveBeenCalledWith(
        updateMenuDto.id,
        { name: 'Updated System' },
        { new: true },
      );
      expect(result.name).toBe('Updated System');
    });

    it('应该对不存在的菜单抛出NotFoundException', async () => {
      const updateMenuDto: UpdateMenuDto = {
        id: new Types.ObjectId().toString(),
        name: 'Updated System',
      };

      mockMenuModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.update(updateMenuDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('应该删除菜单', async () => {
      const menuId = mockMenu._id.toString();
      mockMenuModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMenu),
      });

      await service.delete(menuId);

      expect(mockMenuModel.findByIdAndDelete).toHaveBeenCalledWith(menuId);
    });

    it('应该对不存在的菜单抛出NotFoundException', async () => {
      const menuId = new Types.ObjectId().toString();
      mockMenuModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete(menuId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('buildMenuTree', () => {
    it('应该正确构建菜单树', () => {
      const id1 = new Types.ObjectId();
      const id2 = new Types.ObjectId();
      const id3 = new Types.ObjectId();
      const id4 = new Types.ObjectId();
      
      const menus = [
        { _id: id1, parentId: null, name: 'Root 1' },
        { _id: id2, parentId: null, name: 'Root 2' },
        { _id: id3, parentId: id1, name: 'Child 1' },
        { _id: id4, parentId: id1, name: 'Child 2' },
      ] as any;

      const result = (service as any).buildMenuTree(menus);

      expect(result).toHaveLength(2);
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children[0].name).toBe('Child 1');
      expect(result[0].children[1].name).toBe('Child 2');
    });

    it('应该处理没有子菜单的情况', () => {
      const id1 = new Types.ObjectId();
      const id2 = new Types.ObjectId();
      
      const menus = [
        { _id: id1, parentId: null, name: 'Root 1' },
        { _id: id2, parentId: null, name: 'Root 2' },
      ] as any;

      const result = (service as any).buildMenuTree(menus);

      expect(result).toHaveLength(2);
      expect(result[0].children).toHaveLength(0);
      expect(result[1].children).toHaveLength(0);
    });
  });

  describe('convertToResponseDto', () => {
    it('应该正确转换响应DTO', () => {
      const menuTree = {
        _id: mockMenu._id,
        parentId: null,
        path: '/system',
        name: 'System',
        component: 'views/System/index',
        redirect: null,
        metaTitle: '系统管理',
        metaIcon: 'carbon:settings',
        metaHidden: false,
        metaAlwaysShow: false,
        sortOrder: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      } as any;

      const result = (service as any).convertToResponseDto(menuTree);

      expect(result).toHaveProperty('id', mockMenu._id.toString());
      expect(result).toHaveProperty('path', '/system');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('title', '系统管理');
      expect(result.meta).toHaveProperty('icon', 'carbon:settings');
      expect(result).toHaveProperty('children', []);
    });
  });
});