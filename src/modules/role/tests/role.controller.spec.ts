import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from '../controllers/role.controller';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleWithIdDto } from '../dto/update-role-with-id.dto';
import { Role } from '../entities/role.entity';

describe('角色控制器', () => {
  let controller: RoleController;
  let service: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            remove: jest.fn(),
            updatePermissions: jest.fn(),
            update: jest.fn(),
            findPermissionsByRoleId: jest.fn(),
            getRoleTypes: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
    service = module.get<RoleService>(RoleService);
  });

  it('应该被正确定义', () => {
    expect(controller).toBeDefined();
  });

  describe('创建角色', () => {
    it('应该调用roleService.create', async () => {
      const createDto: CreateRoleDto = {
        name: 'New Role',
        type: 'USER',
        description: 'Test Description',
      };
      const mockRole = { id: '1', ...createDto } as Role;
      (service.create as jest.Mock).mockResolvedValue(mockRole);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockRole);
    });
  });

  describe('查询所有角色', () => {
    it('应该调用roleService.findAll', async () => {
      const mockRoles = [{ id: '1', name: 'Role 1' }];
      (service.findAll as jest.Mock).mockResolvedValue(mockRoles);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockRoles);
    });
  });

  describe('删除角色', () => {
    it('应该调用roleService.remove', async () => {
      (service.remove as jest.Mock).mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('更新角色权限', () => {
    it('应该调用roleService.updatePermissions', async () => {
      const mockRole = { id: '1', name: 'Test Role', permissions: [] } as Role;
      (service.updatePermissions as jest.Mock).mockResolvedValue(mockRole);

      const result = await controller.updatePermissions('1', ['perm-1']);

      expect(service.updatePermissions).toHaveBeenCalledWith('1', ['perm-1']);
      expect(result).toEqual(mockRole);
    });
  });

  describe('更新角色', () => {
    it('应该调用roleService.update', async () => {
      const updateDto: UpdateRoleWithIdDto = {
        id: '1',
        name: 'Updated Role',
        description: 'Updated Description',
      };
      const mockRole = {
        id: '1',
        name: 'Updated Role',
        description: 'Updated Description',
      } as Role;
      (service.update as jest.Mock).mockResolvedValue(mockRole);

      const result = await controller.update(updateDto);

      expect(service.update).toHaveBeenCalledWith('1', updateDto);
      expect(result).toEqual(mockRole);
    });
  });

  describe('获取角色权限', () => {
    it('应该调用roleService.findPermissionsByRoleId', async () => {
      const mockPermissions = [{ id: 'perm-1', name: 'Permission 1' }];
      (service.findPermissionsByRoleId as jest.Mock).mockResolvedValue(
        mockPermissions,
      );

      const result = await controller.getPermissions('1', 'API');

      expect(service.findPermissionsByRoleId).toHaveBeenCalledWith('1', 'API');
      expect(result).toEqual(mockPermissions);
    });

    it('应该在没有类型参数时调用roleService.findPermissionsByRoleId', async () => {
      const mockPermissions = [{ id: 'perm-1', name: 'Permission 1' }];
      (service.findPermissionsByRoleId as jest.Mock).mockResolvedValue(
        mockPermissions,
      );

      const result = await controller.getPermissions('1');

      expect(service.findPermissionsByRoleId).toHaveBeenCalledWith(
        '1',
        undefined,
      );
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('获取角色类型', () => {
    it('应该调用roleService.getRoleTypes', () => {
      const mockRoleTypes = [{ value: 'USER', label: '用户' }];
      (service.getRoleTypes as jest.Mock).mockReturnValue(mockRoleTypes);

      const result = controller.getRoleTypes();

      expect(service.getRoleTypes).toHaveBeenCalled();
      expect(result).toEqual(mockRoleTypes);
    });
  });
});
