import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from '../controllers/role.controller';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleWithIdDto } from '../dto/update-role-with-id.dto';
import { RoleType } from '../../../common/enums/role-type.enum';
import { Role } from '../entities/role.entity';
import { Permission } from '../../permission/entities/permission.entity';

describe('RoleController', () => {
  let roleController: RoleController;
  let roleService: jest.Mocked<RoleService>;

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

    roleController = module.get<RoleController>(RoleController);
    roleService = module.get(RoleService);
  });

  describe('create', () => {
    it('应该成功创建新角色', async () => {
      // 安排
      const createRoleDto: CreateRoleDto = {
        name: '测试角色',
        type: RoleType.OPERATOR,
        description: '测试角色描述',
      };
      const createdRole: any = {
        id: 'role123',
        ...createRoleDto,
        status: 'active',
        isSystem: false,
        permissions: [],
        users: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      roleService.create.mockResolvedValue(createdRole);

      // 执行
      const result = await roleController.create(createRoleDto);

      // 断言
      expect(result).toEqual(createdRole);
      expect(roleService.create).toHaveBeenCalledWith(createRoleDto);
    });
  });

  describe('findAll', () => {
    it('应该成功获取所有角色列表', async () => {
      // 安排
      const mockRoles: any[] = [
        {
          id: '1',
          name: '管理员',
          type: RoleType.ADMIN,
          description: '系统管理员',
          status: 'active',
          isSystem: true,
          permissions: [],
          users: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: '操作员',
          type: RoleType.OPERATOR,
          description: '普通操作员',
          status: 'active',
          isSystem: false,
          permissions: [],
          users: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      roleService.findAll.mockResolvedValue(mockRoles);

      // 执行
      const result = await roleController.findAll();

      // 断言
      expect(result).toEqual(mockRoles);
      expect(roleService.findAll).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('应该成功删除角色', async () => {
      // 安排
      const roleId = 'role123';

      roleService.remove.mockResolvedValue();

      // 执行
      const result = await roleController.remove(roleId);

      // 断言
      expect(result).toBeUndefined();
      expect(roleService.remove).toHaveBeenCalledWith(roleId);
    });
  });

  describe('updatePermissions', () => {
    it('应该成功更新角色权限', async () => {
      // 安排
      const roleId = 'role123';
      const permissionIds = ['perm1', 'perm2', 'perm3'];
      const updatedRole: any = {
        id: roleId,
        name: '测试角色',
        type: RoleType.OPERATOR,
        description: '测试角色描述',
        status: 'active',
        isSystem: false,
        permissions: [
          {
            id: 'perm1',
            name: '权限1',
            description: '权限1描述',
          } as Permission,
          {
            id: 'perm2',
            name: '权限2',
            description: '权限2描述',
          } as Permission,
          {
            id: 'perm3',
            name: '权限3',
            description: '权限3描述',
          } as Permission,
        ],
        users: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      roleService.updatePermissions.mockResolvedValue(updatedRole);

      // 执行
      const result = await roleController.updatePermissions(
        roleId,
        permissionIds,
      );

      // 断言
      expect(result).toEqual(updatedRole);
      expect(roleService.updatePermissions).toHaveBeenCalledWith(
        roleId,
        permissionIds,
      );
    });
  });

  describe('update', () => {
    it('应该成功更新角色信息', async () => {
      // 安排
      const updateRoleDto: UpdateRoleWithIdDto = {
        id: 'role123',
        name: '更新后的角色',
        description: '更新后的角色描述',
      };
      const updatedRole: any = {
        id: 'role123',
        name: '更新后的角色',
        type: RoleType.OPERATOR,
        description: '更新后的角色描述',
        status: 'active',
        isSystem: false,
        permissions: [],
        users: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      roleService.update.mockResolvedValue(updatedRole);

      // 执行
      const result = await roleController.update(updateRoleDto);

      // 断言
      expect(result).toEqual(updatedRole);
      expect(roleService.update).toHaveBeenCalledWith('role123', updateRoleDto);
    });
  });

  describe('getPermissions', () => {
    it('应该成功获取角色权限列表', async () => {
      // 安排
      const roleId = 'role123';
      const mockPermissions: any[] = [
        { id: 'perm1', name: '权限1', description: '权限1描述', type: 'API' },
        { id: 'perm2', name: '权限2', description: '权限2描述', type: 'PAGE' },
      ];

      roleService.findPermissionsByRoleId.mockResolvedValue(mockPermissions);

      // 执行
      const result = await roleController.getPermissions(roleId);

      // 断言
      expect(result).toEqual(mockPermissions);
      expect(roleService.findPermissionsByRoleId).toHaveBeenCalledWith(
        roleId,
        undefined,
      );
    });

    it('应该根据类型筛选获取角色权限列表', async () => {
      // 安排
      const roleId = 'role123';
      const permissionType = 'API';
      const mockPermissions: any[] = [
        { id: 'perm1', name: '权限1', description: '权限1描述', type: 'API' },
        { id: 'perm3', name: '权限3', description: '权限3描述', type: 'API' },
      ];

      roleService.findPermissionsByRoleId.mockResolvedValue(mockPermissions);

      // 执行
      const result = await roleController.getPermissions(
        roleId,
        permissionType,
      );

      // 断言
      expect(result).toEqual(mockPermissions);
      expect(roleService.findPermissionsByRoleId).toHaveBeenCalledWith(
        roleId,
        permissionType,
      );
    });
  });

  describe('getRoleTypes', () => {
    it('应该成功获取所有角色类型', async () => {
      // 安排
      const mockRoleTypes = [
        { value: 'super_admin', label: '超级管理员' },
        { value: 'admin', label: '管理员' },
        { value: 'operator', label: '操作员' },
      ];

      roleService.getRoleTypes.mockReturnValue(mockRoleTypes);

      // 执行
      const result = await roleController.getRoleTypes();

      // 断言
      expect(result).toEqual(mockRoleTypes);
      expect(roleService.getRoleTypes).toHaveBeenCalled();
    });
  });
});
