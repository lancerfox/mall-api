import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleService } from '../services/role.service';
import { Role } from '../entities/role.entity';
import { PermissionService } from '../../permission/services/permission.service';
import { Repository } from 'typeorm';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { RoleType } from '../../../common/enums/role-type.enum';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Permission } from '../../permission/entities/permission.entity';

describe('角色服务', () => {
  let service: RoleService;
  let roleRepository: Repository<Role>;
  let permissionService: PermissionService;

  // Mock data
  const mockRole = {
    id: '1',
    name: 'Test Role',
    type: RoleType.ADMIN,
    description: 'Test Description',
    status: 'active',
    isSystem: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: [],
  } as Role;

  const mockPermission = {
    id: 'perm-1',
    name: 'test:permission',
    description: 'Test Permission',
    type: 'API',
  } as Permission;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            findBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
            preload: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: PermissionService,
          useValue: {
            findByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    permissionService = module.get<PermissionService>(PermissionService);
  });

  it('应该被正确定义', () => {
    expect(service).toBeDefined();
  });

  describe('创建角色', () => {
    it('应该成功创建一个角色', async () => {
      const createDto: CreateRoleDto = {
        name: 'New Role',
        type: RoleType.ADMIN,
        description: 'Test Description',
      };

      (roleRepository.findOneBy as jest.Mock).mockResolvedValue(null);
      (roleRepository.create as jest.Mock).mockReturnValue({
        ...mockRole,
        ...createDto,
        id: 'new-id',
      });
      (roleRepository.save as jest.Mock).mockResolvedValue({
        ...mockRole,
        ...createDto,
        id: 'new-id',
      });

      const result = await service.create(createDto);

      expect(roleRepository.findOneBy).toHaveBeenCalledWith({
        name: createDto.name,
      });
      expect(roleRepository.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('如果角色名称已存在应该抛出ROLE_ALREADY_EXISTS错误', async () => {
      const createDto: CreateRoleDto = {
        name: 'Existing Role',
        type: RoleType.ADMIN,
        description: 'Test Description',
      };

      (roleRepository.findOneBy as jest.Mock).mockResolvedValue(mockRole);

      await expect(service.create(createDto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.ROLE_ALREADY_EXISTS),
      );
    });

    it('should throw VALIDATION_INVALID_ID error if role type is invalid', async () => {
      const createDto: CreateRoleDto = {
        name: 'New Role',
        type: 'INVALID_TYPE' as RoleType,
        description: 'Test Description',
      };

      (roleRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.VALIDATION_INVALID_ID),
      );
    });

    it('应该正确处理权限关联', async () => {
      const createDto: CreateRoleDto = {
        name: 'New Role With Permissions',
        type: RoleType.ADMIN,
        description: 'Test Description',
        permissions: ['perm-1'],
      };

      (roleRepository.findOneBy as jest.Mock).mockResolvedValue(null);
      (permissionService.findByIds as jest.Mock).mockResolvedValue([
        mockPermission,
      ]);
      (roleRepository.create as jest.Mock).mockReturnValue({
        ...mockRole,
        ...createDto,
        id: 'new-id',
        permissions: [mockPermission],
      });
      (roleRepository.save as jest.Mock).mockResolvedValue({
        ...mockRole,
        ...createDto,
        id: 'new-id',
        permissions: [mockPermission],
      });

      const result = await service.create(createDto);

      expect(permissionService.findByIds).toHaveBeenCalledWith(['perm-1']);
      expect(result.permissions).toEqual([mockPermission]);
    });

    it('如果某些权限不存在应该抛出PERMISSION_NOT_FOUND错误', async () => {
      const createDto: CreateRoleDto = {
        name: 'New Role With Permissions',
        type: RoleType.ADMIN,
        description: 'Test Description',
        permissions: ['perm-1', 'perm-2'],
      };

      (roleRepository.findOneBy as jest.Mock).mockResolvedValue(null);
      (permissionService.findByIds as jest.Mock).mockResolvedValue([
        mockPermission,
      ]); // Only returns one permission

      await expect(service.create(createDto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.PERMISSION_NOT_FOUND),
      );
    });
  });

  describe('查询所有角色', () => {
    it('应该以列表格式返回所有角色', async () => {
      const mockRoles = [mockRole];
      (roleRepository.find as jest.Mock).mockResolvedValue(mockRoles);

      const result = await service.findAll();

      expect(roleRepository.find).toHaveBeenCalledWith({
        select: [
          'id',
          'name',
          'type',
          'description',
          'status',
          'isSystem',
          'createdAt',
          'updatedAt',
        ],
      });
      expect(result).toEqual(mockRoles.map((role) => ({ ...role })));
    });
  });

  describe('查找单个角色', () => {
    it('应该通过ID返回一个包含权限的角色', async () => {
      (roleRepository.findOne as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.findOne('1');

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['permissions'],
      });
      expect(result).toEqual(mockRole);
    });

    it('如果角色不存在应该抛出ROLE_NOT_FOUND错误', async () => {
      (roleRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        new BusinessException(ERROR_CODES.ROLE_NOT_FOUND),
      );
    });
  });

  describe('通过ID查找角色', () => {
    it('应该通过ID返回一个角色', async () => {
      (roleRepository.findOne as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.findById('1');

      expect(result).toEqual(mockRole);
    });
  });

  describe('通过名称查找角色', () => {
    it('应该通过名称返回一个角色', async () => {
      (roleRepository.findOne as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.findByName('Test Role');

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Test Role' },
        relations: ['permissions'],
      });
      expect(result).toEqual(mockRole);
    });

    it('如果名称对应的角色不存在应该返回null', async () => {
      (roleRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.findByName('Nonexistent Role');

      expect(result).toBeNull();
    });
  });

  describe('通过类型查找角色', () => {
    it('应该通过类型返回一个角色', async () => {
      (roleRepository.findOne as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.findByType(RoleType.ADMIN);

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { type: RoleType.ADMIN },
        relations: ['permissions'],
      });
      expect(result).toEqual(mockRole);
    });

    it('如果类型对应的角色不存在应该返回null', async () => {
      (roleRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.findByType(RoleType.ADMIN);

      expect(result).toBeNull();
    });
  });

  describe('通过ID列表查找角色', () => {
    it('应该通过ID返回角色', async () => {
      const mockRoles = [mockRole];
      (roleRepository.findBy as jest.Mock).mockResolvedValue(mockRoles);

      const result = await service.findByIds(['1']);

      expect(roleRepository.findBy).toHaveBeenCalledWith({
        id: expect.anything(),
      });
      expect(result).toEqual(mockRoles);
    });
  });

  describe('更新角色', () => {
    it('应该成功更新一个角色', async () => {
      const updateDto: UpdateRoleDto = {
        description: 'Updated Description',
      };

      const updatedRole = { ...mockRole, description: 'Updated Description' };

      (roleRepository.findOne as jest.Mock).mockResolvedValue(mockRole);
      (roleRepository.save as jest.Mock).mockResolvedValue(updatedRole);

      const result = await service.update('1', updateDto);

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['permissions'],
      });
      expect(result).toEqual(updatedRole);
    });

    it('如果角色不存在应该抛出ROLE_NOT_FOUND错误', async () => {
      (roleRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update('nonexistent', {} as UpdateRoleDto),
      ).rejects.toThrow(new BusinessException(ERROR_CODES.ROLE_NOT_FOUND));
    });

    it('应该处理权限更新', async () => {
      const updateDto: UpdateRoleDto = {
        permissions: ['perm-1'],
      };

      const updatedRole = { ...mockRole, permissions: [mockPermission] };

      (roleRepository.findOne as jest.Mock).mockResolvedValue(mockRole);
      (permissionService.findByIds as jest.Mock).mockResolvedValue([
        mockPermission,
      ]);
      (roleRepository.save as jest.Mock).mockResolvedValue(updatedRole);

      const result = await service.update('1', updateDto);

      expect(permissionService.findByIds).toHaveBeenCalledWith(['perm-1']);
      expect(result.permissions).toEqual([mockPermission]);
    });

    it('不应该允许更改角色类型', async () => {
      const updateDto: UpdateRoleDto = {
        type: RoleType.SUPER_ADMIN,
      };

      (roleRepository.findOne as jest.Mock).mockResolvedValue(mockRole);

      await expect(service.update('1', updateDto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.ROLE_TYPE_CANNOT_CHANGE),
      );
    });
  });

  describe('remove', () => {
    it('should remove a role successfully', async () => {
      (roleRepository.findOneBy as jest.Mock).mockResolvedValue(mockRole);
      (roleRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(roleRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw ROLE_NOT_FOUND error if role does not exist', async () => {
      (roleRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        new BusinessException(ERROR_CODES.ROLE_NOT_FOUND),
      );
    });

    it('should throw ROLE_CANNOT_DELETE_SYSTEM error if trying to remove system role', async () => {
      const systemRole = { ...mockRole, isSystem: true };
      (roleRepository.findOneBy as jest.Mock).mockResolvedValue(systemRole);

      await expect(service.remove('1')).rejects.toThrow(
        new BusinessException(ERROR_CODES.ROLE_CANNOT_DELETE_SYSTEM),
      );
    });
  });

  describe('添加权限到角色', () => {
    it('应该向角色添加权限', async () => {
      const roleWithPermissions = { ...mockRole, permissions: [] };
      const updatedRole = { ...mockRole, permissions: [mockPermission] };

      (roleRepository.findOne as jest.Mock).mockResolvedValue(
        roleWithPermissions,
      );
      (permissionService.findByIds as jest.Mock).mockResolvedValue([
        mockPermission,
      ]);
      (roleRepository.save as jest.Mock).mockResolvedValue(updatedRole);

      const result = await service.addPermissions('1', ['perm-1']);

      expect(result.permissions).toContainEqual(mockPermission);
    });

    it('如果角色不存在应该抛出ROLE_NOT_FOUND错误', async () => {
      (roleRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.addPermissions('nonexistent', ['perm-1']),
      ).rejects.toThrow(new BusinessException(ERROR_CODES.ROLE_NOT_FOUND));
    });

    it('如果权限不存在应该抛出PERMISSION_NOT_FOUND错误', async () => {
      (roleRepository.findOne as jest.Mock).mockResolvedValue(mockRole);
      (permissionService.findByIds as jest.Mock).mockResolvedValue([]); // No permissions found

      await expect(
        service.addPermissions('1', ['nonexistent']),
      ).rejects.toThrow(
        new BusinessException(ERROR_CODES.PERMISSION_NOT_FOUND),
      );
    });
  });

  describe('更新角色权限', () => {
    it('应该为角色更新权限', async () => {
      const updatedRole = { ...mockRole, permissions: [mockPermission] };

      (roleRepository.findOneBy as jest.Mock).mockResolvedValue(mockRole);
      (permissionService.findByIds as jest.Mock).mockResolvedValue([
        mockPermission,
      ]);
      (roleRepository.save as jest.Mock).mockResolvedValue(updatedRole);

      const result = await service.updatePermissions('1', ['perm-1']);

      expect(result.permissions).toEqual([mockPermission]);
    });

    it('如果角色不存在应该抛出ROLE_NOT_FOUND错误', async () => {
      (roleRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updatePermissions('nonexistent', ['perm-1']),
      ).rejects.toThrow(new BusinessException(ERROR_CODES.ROLE_NOT_FOUND));
    });
  });

  describe('通过角色ID查找权限', () => {
    it('应该返回角色的权限', async () => {
      const roleWithPerms = {
        ...mockRole,
        permissions: [mockPermission],
      };
      (roleRepository.findOne as jest.Mock).mockResolvedValue(roleWithPerms);

      const result = await service.findPermissionsByRoleId('1');

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['permissions'],
      });
      expect(result).toEqual([
        {
          id: 'perm-1',
          name: 'test:permission',
          description: 'Test Permission',
          code: 'test:permission',
          type: 'API',
        },
      ]);
    });

    it('如果角色不存在应该抛出ROLE_NOT_FOUND错误', async () => {
      (roleRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.findPermissionsByRoleId('nonexistent'),
      ).rejects.toThrow(new BusinessException(ERROR_CODES.ROLE_NOT_FOUND));
    });

    it('应该按类型筛选权限', async () => {
      const roleWithPerms = {
        ...mockRole,
        permissions: [
          { ...mockPermission, type: 'API' },
          { ...mockPermission, id: 'perm-2', type: 'PAGE' },
        ],
      };

      (roleRepository.findOne as jest.Mock).mockResolvedValue(roleWithPerms);

      const result = await service.findPermissionsByRoleId('1', 'API');

      expect(result).toEqual([
        expect.objectContaining({ id: 'perm-1', type: 'API' }),
      ]);
    });
  });

  describe('获取角色类型', () => {
    it('应该返回带标签的角色类型', () => {
      const result = service.getRoleTypes();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('value');
      expect(result[0]).toHaveProperty('label');
    });
  });
});
