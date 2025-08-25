import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Menu, MenuDocument, MenuSchema } from './menu.entity';

describe('Menu Entity', () => {
  let menuModel: Model<MenuDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(Menu.name),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn().mockResolvedValue({}),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    menuModel = module.get<Model<MenuDocument>>(getModelToken(Menu.name));
  });

  it('should be defined', () => {
    expect(menuModel).toBeDefined();
  });

  describe('Menu Schema', () => {
    it('should have required fields', () => {
      const menuSchema = MenuSchema;
      const paths = menuSchema.paths;

      expect(paths.title).toBeDefined();
      expect(paths.name).toBeDefined();
      expect(paths.type).toBeDefined();
      expect(paths.status).toBeDefined();
      expect(paths.sort).toBeDefined();
      expect(paths.hidden).toBeDefined();
      expect(paths.keepAlive).toBeDefined();
    });

    it('should have correct default values', () => {
      const menuSchema = MenuSchema;
      const paths = menuSchema.paths;

      expect(paths.sort.defaultValue).toBe(0);
      expect(paths.type.defaultValue).toBe('menu');
      expect(paths.status.defaultValue).toBe('active');
      expect(paths.hidden.defaultValue).toBe(false);
      expect(paths.keepAlive.defaultValue).toBe(true);
    });

    it('should have correct enum values for type', () => {
      const menuSchema = MenuSchema;
      const typePath = menuSchema.paths.type;

      expect(typePath.enumValues).toContain('menu');
      expect(typePath.enumValues).toContain('button');
      expect(typePath.enumValues).toContain('page');
    });

    it('should have correct enum values for status', () => {
      const menuSchema = MenuSchema;
      const statusPath = menuSchema.paths.status;

      expect(statusPath.enumValues).toContain('active');
      expect(statusPath.enumValues).toContain('inactive');
    });

    it('should have timestamps enabled', () => {
      const menuSchema = MenuSchema;
      expect(menuSchema.options.timestamps).toBe(true);
    });

    it('should have proper indexes', () => {
      const menuSchema = MenuSchema;
      const indexes = menuSchema.indexes();

      // Check if indexes exist
      expect(indexes.length).toBeGreaterThan(0);

      // Find specific indexes
      const parentIdSortIndex = indexes.find(
        (index) => index[0].parentId === 1 && index[0].sort === 1,
      );
      const statusIndex = indexes.find((index) => index[0].status === 1);
      const typeIndex = indexes.find((index) => index[0].type === 1);
      const nameIndex = indexes.find(
        (index) => index[0].name === 1 && index[1]?.unique === true,
      );

      expect(parentIdSortIndex).toBeDefined();
      expect(statusIndex).toBeDefined();
      expect(typeIndex).toBeDefined();
      expect(nameIndex).toBeDefined();
    });

    it('should have virtual children field', () => {
      const menuSchema = MenuSchema;
      const virtuals = menuSchema.virtuals;

      expect(virtuals.children).toBeDefined();
      expect(virtuals.children.options.ref).toBe('Menu');
      expect(virtuals.children.options.localField).toBe('_id');
      expect(virtuals.children.options.foreignField).toBe('parentId');
    });

    it('should include virtuals in JSON serialization', () => {
      const menuSchema = MenuSchema;
      const options = menuSchema.options;

      expect(options.toJSON.virtuals).toBe(true);
      expect(options.toObject.virtuals).toBe(true);
    });
  });

  describe('Menu Entity Validation', () => {
    it('should create a valid menu instance', () => {
      const menuData = {
        title: '用户管理',
        name: 'UserManagement',
        path: '/system/user',
        component: 'system/user/index',
        icon: 'user',
        sort: 1,
        type: 'menu',
        status: 'active',
        permission: 'system:user:list',
        hidden: false,
        keepAlive: true,
      };

      const menu = new Menu();
      Object.assign(menu, menuData);

      expect(menu.title).toBe('用户管理');
      expect(menu.name).toBe('UserManagement');
      expect(menu.path).toBe('/system/user');
      expect(menu.component).toBe('system/user/index');
      expect(menu.icon).toBe('user');
      expect(menu.sort).toBe(1);
      expect(menu.type).toBe('menu');
      expect(menu.status).toBe('active');
      expect(menu.permission).toBe('system:user:list');
      expect(menu.hidden).toBe(false);
      expect(menu.keepAlive).toBe(true);
    });

    it('should handle optional fields', () => {
      const menuData = {
        title: '系统管理',
        name: 'SystemManagement',
        type: 'menu',
        redirect: '/system/user',
        meta: {
          title: '系统管理',
          icon: 'system',
          noCache: false,
          breadcrumb: true,
          affix: false,
        },
      };

      const menu = new Menu();
      Object.assign(menu, menuData);

      expect(menu.redirect).toBe('/system/user');
      expect(menu.meta).toEqual({
        title: '系统管理',
        icon: 'system',
        noCache: false,
        breadcrumb: true,
        affix: false,
      });
      expect(menu.path).toBeUndefined();
      expect(menu.component).toBeUndefined();
      expect(menu.parentId).toBeUndefined();
    });

    it('should handle menu with parent relationship', () => {
      const parentId = '507f1f77bcf86cd799439011';
      const menuData = {
        title: '用户列表',
        name: 'UserList',
        path: '/system/user/list',
        component: 'system/user/list/index',
        parentId: parentId,
        sort: 1,
        type: 'page',
      };

      const menu = new Menu();
      Object.assign(menu, menuData);

      expect(menu.parentId).toBe(parentId);
      expect(menu.type).toBe('page');
    });

    it('should handle button type menu', () => {
      const menuData = {
        title: '添加用户',
        name: 'AddUser',
        type: 'button',
        permission: 'system:user:add',
        hidden: true,
      };

      const menu = new Menu();
      Object.assign(menu, menuData);

      expect(menu.type).toBe('button');
      expect(menu.permission).toBe('system:user:add');
      expect(menu.hidden).toBe(true);
      expect(menu.path).toBeUndefined();
      expect(menu.component).toBeUndefined();
    });
  });
});
