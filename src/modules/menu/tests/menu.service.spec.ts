import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MenuService } from '../services/menu.service';
import { Menu, MenuDocument } from '../entities/menu.entity';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MenuService', () => {
  let service: MenuService;
  let model: Model<MenuDocument>;

  const mockMenu = {
    _id: new Types.ObjectId(),
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
    toObject: () => mockMenu,
  };

  const mockMenuModel = {
    new: jest.fn().mockResolvedValue(mockMenu),
    constructor: jest.fn().mockResolvedValue(mockMenu),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    bulkWrite: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
    populate: jest.fn(),
    sort: jest.fn(),
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
    model = module.get<Model<MenuDocument>>(getModelToken(Menu.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      mockMenuModel.findOne.mockResolvedValue(null);
      mockMenuModel.findOne.mockResolvedValueOnce(null); // for max sort check
      const mockCreatedMenu = {
        ...mockMenu,
        save: jest.fn().mockResolvedValue(mockMenu),
      };
      jest.spyOn(model, 'constructor' as any).mockReturnValue(mockCreatedMenu);

      const result = await service.create(createMenuDto);

      expect(result).toBeDefined();
      expect(result.title).toBe(createMenuDto.title);
      expect(result.name).toBe(createMenuDto.name);
    });

    it('should throw BadRequestException if menu name already exists', async () => {
      const createMenuDto: CreateMenuDto = {
        title: 'Test Menu',
        name: 'TestMenu',
        type: 'menu',
      };

      mockMenuModel.findOne.mockResolvedValue(mockMenu);

      await expect(service.create(createMenuDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all menus', async () => {
      const mockMenus = [mockMenu];
      mockMenuModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockMenus),
          }),
        }),
      });

      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findTree', () => {
    it('should return menu tree structure', async () => {
      const mockMenus = [mockMenu];
      mockMenuModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockMenus),
        }),
      });

      const result = await service.findTree();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a menu by id', async () => {
      const menuId = new Types.ObjectId().toString();
      mockMenuModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockMenu),
        }),
      });

      const result = await service.findOne(menuId);

      expect(result).toBeDefined();
      expect(result.title).toBe(mockMenu.title);
    });

    it('should throw BadRequestException for invalid id', async () => {
      const invalidId = 'invalid-id';

      await expect(service.findOne(invalidId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if menu not found', async () => {
      const menuId = new Types.ObjectId().toString();
      mockMenuModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.findOne(menuId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a menu successfully', async () => {
      const menuId = new Types.ObjectId().toString();
      const updateMenuDto: UpdateMenuDto = {
        title: 'Updated Menu',
      };

      mockMenuModel.findById.mockResolvedValue(mockMenu);
      mockMenuModel.findOne.mockResolvedValue(null);
      mockMenuModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockMenu),
        }),
      });

      const result = await service.update(menuId, updateMenuDto);

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if menu not found', async () => {
      const menuId = new Types.ObjectId().toString();
      const updateMenuDto: UpdateMenuDto = {
        title: 'Updated Menu',
      };

      mockMenuModel.findById.mockResolvedValue(null);

      await expect(service.update(menuId, updateMenuDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a menu successfully', async () => {
      const menuId = new Types.ObjectId().toString();

      mockMenuModel.findById.mockResolvedValue(mockMenu);
      mockMenuModel.countDocuments.mockResolvedValue(0);
      mockMenuModel.findByIdAndDelete.mockResolvedValue(mockMenu);

      await expect(service.remove(menuId)).resolves.not.toThrow();
    });

    it('should throw BadRequestException if menu has children', async () => {
      const menuId = new Types.ObjectId().toString();

      mockMenuModel.findById.mockResolvedValue(mockMenu);
      mockMenuModel.countDocuments.mockResolvedValue(1);

      await expect(service.remove(menuId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('sortMenus', () => {
    it('should sort menus successfully', async () => {
      const sortData = [
        { id: new Types.ObjectId().toString(), sort: 1 },
        { id: new Types.ObjectId().toString(), sort: 2 },
      ];

      mockMenuModel.bulkWrite.mockResolvedValue({});

      await expect(service.sortMenus(sortData)).resolves.not.toThrow();
    });
  });
});
