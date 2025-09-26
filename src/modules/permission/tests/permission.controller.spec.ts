import { Test, TestingModule } from '@nestjs/testing';
import { PermissionController } from '../controllers/permission.controller';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionWithIdDto } from '../dto/update-permission-with-id.dto';
import { Permission } from '../entities/permission.entity';
import { PermissionType } from '../../../common/decorators/roles.decorator';

describe('PermissionController', () => {
  let permissionController: PermissionController;
  let permissionService: jest.Mocked<PermissionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        {
          provide: PermissionService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByType: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    permissionController =
      module.get<PermissionController>(PermissionController);
    permissionService = module.get(PermissionService);
  });

  describe('create', () => {
    it('应该成功创建新权限', async () => {
      // 安排
      const createPermissionDto: CreatePermissionDto = {
        name: 'test.permission',
        description: '测试权限',
        type: PermissionType.API,
        module: 'test',
        status: 'active',
      };
      const createdPermission: any = {
        id: 'permission123',
        ...createPermissionDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      permissionService.create.mockResolvedValue(createdPermission);

      // 执行
      const result = await permissionController.create(createPermissionDto);

      // 断言
      expect(result).toEqual(createdPermission);
      expect(permissionService.create).toHaveBeenCalledWith(
        createPermissionDto,
      );
    });
  });

  describe('findAll', () => {
    it('应该成功获取所有权限列表', async () => {
      // 安排
      const mockPermissions: any[] = [
        {
          id: '1',
          name: 'permission.one',
          description: '权限一',
          type: PermissionType.API,
          module: 'module1',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'permission.two',
          description: '权限二',
          type: PermissionType.PAGE,
          module: 'module2',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      permissionService.findAll.mockResolvedValue(mockPermissions);

      // 执行
      const result = await permissionController.findAll();

      // 断言
      expect(result).toEqual(mockPermissions);
      expect(permissionService.findAll).toHaveBeenCalled();
    });

    it('应该根据类型筛选权限列表', async () => {
      // 安排
      const permissionType = PermissionType.API;
      const mockPermissions: any[] = [
        {
          id: '1',
          name: 'api.permission.one',
          description: 'API权限一',
          type: PermissionType.API,
          module: 'module1',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'api.permission.two',
          description: 'API权限二',
          type: PermissionType.API,
          module: 'module2',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      permissionService.findByType.mockResolvedValue(mockPermissions);

      // 执行
      const result = await permissionController.findAll(permissionType);

      // 断言
      expect(result).toEqual(mockPermissions);
      expect(permissionService.findByType).toHaveBeenCalledWith(permissionType);
    });
  });

  describe('remove', () => {
    it('应该成功删除权限', async () => {
      // 安排
      const permissionId = 'permission123';

      permissionService.remove.mockResolvedValue();

      // 执行
      const result = await permissionController.remove(permissionId);

      // 断言
      expect(result).toBeUndefined();
      expect(permissionService.remove).toHaveBeenCalledWith(permissionId);
    });
  });

  describe('update', () => {
    it('应该成功更新权限信息', async () => {
      // 安排
      const updatePermissionDto: UpdatePermissionWithIdDto = {
        id: 'permission123',
        name: 'updated.permission',
        description: '更新后的权限',
        type: PermissionType.PAGE,
        module: 'updated-module',
        status: 'inactive',
      };
      const updatedPermission: any = {
        id: 'permission123',
        name: 'updated.permission',
        description: '更新后的权限',
        type: PermissionType.PAGE,
        module: 'updated-module',
        status: 'inactive',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      permissionService.update.mockResolvedValue(updatedPermission);

      // 执行
      const result = await permissionController.update(updatePermissionDto);

      // 断言
      expect(result).toEqual(updatedPermission);
      expect(permissionService.update).toHaveBeenCalledWith('permission123', {
        name: 'updated.permission',
        description: '更新后的权限',
        type: PermissionType.PAGE,
        module: 'updated-module',
        status: 'inactive',
      });
    });
  });
});
