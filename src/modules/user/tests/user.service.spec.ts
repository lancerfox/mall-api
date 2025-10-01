import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '../services/user.service';
import { User } from '../entities/user.entity';
import { RoleService } from '../../role/services/role.service';
import { Repository } from 'typeorm';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { Role } from '../../role/entities/role.entity';
import { RoleType } from '../../../common/enums/role-type.enum';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let roleService: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: RoleService,
          useValue: {
            findByIds: jest.fn(),
            findByType: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    roleService = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user when user exists', async () => {
      const mockUser = new User();
      mockUser.username = 'testuser';
      mockUser.password = 'testpassword';

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne('testuser');
      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        relations: ['roles', 'roles.permissions'],
      });
    });

    it('should return null when user does not exist', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.findOne('nonexistentuser');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user response DTO when user exists', async () => {
      const mockUser = new User();
      mockUser.id = '123';
      mockUser.username = 'testuser';
      mockUser.password = 'testpassword';
      mockUser.roles = [];

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findById('123');
      expect(result).toEqual({
        id: '123',
        username: 'testuser',
        roles: [],
        status: undefined,
        avatar: undefined,
        permissions: [],
        lastLoginTime: undefined,
        lastLoginIp: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        isSuperAdmin: false,
      });
    });

    it('should return null when user does not exist', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.findById('123');
      expect(result).toBeNull();
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login time and IP', async () => {
      (userRepository.update as jest.Mock).mockResolvedValue(undefined);

      await service.updateLastLogin('123', '192.168.1.1');

      expect(userRepository.update).toHaveBeenCalledWith('123', {
        lastLoginTime: expect.any(Date),
        lastLoginIp: '192.168.1.1',
      });
    });

    it('should update only last login time when IP is not provided', async () => {
      (userRepository.update as jest.Mock).mockResolvedValue(undefined);

      await service.updateLastLogin('123');

      expect(userRepository.update).toHaveBeenCalledWith('123', {
        lastLoginTime: expect.any(Date),
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const mockUser = new User();
      mockUser.id = '123';
      mockUser.username = 'testuser';
      mockUser.password = 'testpassword';
      mockUser.roles = [];
      mockUser.avatar = 'new-avatar.jpg';

      (userRepository.update as jest.Mock).mockResolvedValue(undefined);
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.updateProfile('123', {
        avatar: 'new-avatar.jpg',
      });

      expect(result).toEqual({
        id: '123',
        username: 'testuser',
        roles: [],
        status: undefined,
        avatar: 'new-avatar.jpg',
        permissions: [],
        lastLoginTime: undefined,
        lastLoginIp: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        isSuperAdmin: false,
      });
    });

    it('should throw error if user not found', async () => {
      (userRepository.update as jest.Mock).mockResolvedValue(undefined);
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateProfile('123', {
          avatar: 'new-avatar.jpg',
        }),
      ).rejects.toThrow(new BusinessException(ERROR_CODES.USER_NOT_FOUND));
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const mockUser = new User();
      mockUser.id = '123';
      mockUser.password = 'oldPassword';

      (userRepository.findOneBy as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.save as jest.Mock).mockResolvedValue(mockUser);

      await service.updatePassword('123', 'newPassword');

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: '123' });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(mockUser.password).toBe('newPassword');
    });

    it('should throw error if user not found', async () => {
      (userRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updatePassword('123', 'newPassword'),
      ).rejects.toThrow(new BusinessException(ERROR_CODES.USER_NOT_FOUND));
    });
  });

  describe('findAll', () => {
    it('should return paginated user list', async () => {
      const mockUsers = [new User(), new User()];
      mockUsers[0].id = '1';
      mockUsers[0].username = 'user1';
      mockUsers[0].roles = [];
      mockUsers[1].id = '2';
      mockUsers[1].username = 'user2';
      mockUsers[1].roles = [];

      const queryBuilderMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockUsers, 2]),
      };

      (userRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilderMock,
      );

      const query: QueryUserDto = { page: 1, pageSize: 10 };
      const result = await service.findAll(query);

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(result).toEqual({
        list: [
          {
            id: '1',
            username: 'user1',
            roles: [],
            status: undefined,
            avatar: undefined,
            permissions: [],
            lastLoginTime: undefined,
            lastLoginIp: undefined,
            createdAt: undefined,
            updatedAt: undefined,
            isSuperAdmin: false,
          },
          {
            id: '2',
            username: 'user2',
            roles: [],
            status: undefined,
            avatar: undefined,
            permissions: [],
            lastLoginTime: undefined,
            lastLoginIp: undefined,
            createdAt: undefined,
            updatedAt: undefined,
            isSuperAdmin: false,
          },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'newpassword',
        roles: ['role1'],
      };

      const mockExistingUser = null;
      const mockNewUser = {
        ...new User(),
        id: 'newid',
        username: 'newuser',
        password: 'hashedPassword',
        status: 'active',
        roles: [],
      };

      const mockRole = new Role();
      mockRole.id = 'role1';
      mockRole.name = 'Test Role';

      (userRepository.findOneBy as jest.Mock).mockResolvedValue(
        mockExistingUser,
      );
      (userRepository.create as jest.Mock).mockReturnValue(mockNewUser);
      (roleService.findByIds as jest.Mock).mockResolvedValue([mockRole]);
      (userRepository.save as jest.Mock).mockResolvedValue(mockNewUser);
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockNewUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual({
        id: 'newid',
        username: 'newuser',
        roles: [{ id: 'role1', name: 'Test Role', type: undefined }],
        status: 'active',
        avatar: undefined,
        permissions: [],
        lastLoginTime: undefined,
        lastLoginIp: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        isSuperAdmin: false,
      });
    });

    it('should throw error if username already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        password: 'newpassword',
      };

      const mockExistingUser = new User();
      mockExistingUser.username = 'existinguser';

      (userRepository.findOneBy as jest.Mock).mockResolvedValue(
        mockExistingUser,
      );

      await expect(service.create(createUserDto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.USER_ALREADY_EXISTS),
      );
    });

    it('should throw error if role is not found', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'newpassword',
        roles: ['role1', 'role2'],
      };

      const mockExistingUser = null;
      const mockNewUser = {
        ...new User(),
        id: 'newid',
        username: 'newuser',
        password: 'hashedPassword',
        status: 'active',
        roles: [],
      };

      const mockRole = new Role();
      mockRole.id = 'role1';
      mockRole.name = 'Test Role';

      (userRepository.findOneBy as jest.Mock).mockResolvedValue(
        mockExistingUser,
      );
      (roleService.findByIds as jest.Mock).mockResolvedValue([mockRole]); // 返回不匹配的数量

      await expect(service.create(createUserDto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.ROLE_NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    it('should update user information', async () => {
      const updateUserDto: UpdateUserDto = {
        roles: ['role1'],
      };

      const mockUser = new User();
      mockUser.id = '123';
      mockUser.username = 'updateduser';
      mockUser.password = 'oldpassword';
      mockUser.roles = [];

      const mockUpdatedUser = { ...mockUser };
      const mockRole = new Role();
      mockRole.id = 'role1';
      mockRole.name = 'Test Role';

      const mockUserWithRelations = { ...mockUser };
      mockUserWithRelations.roles = [mockRole];

      (userRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(mockUser) // First call for finding user to update
        .mockResolvedValueOnce(mockUserWithRelations); // Second call for returning updated user
      (roleService.findByIds as jest.Mock).mockResolvedValue([mockRole]);
      (userRepository.save as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await service.update('123', updateUserDto);

      expect(result).toEqual({
        id: '123',
        username: 'updateduser',
        roles: [{ id: 'role1', name: 'Test Role', type: undefined }],
        status: undefined,
        avatar: undefined,
        permissions: [],
        lastLoginTime: undefined,
        lastLoginIp: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        isSuperAdmin: false,
      });
    });

    it('should throw error if user not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update('123', { username: 'updated' }),
      ).rejects.toThrow(new BusinessException(ERROR_CODES.USER_NOT_FOUND));
    });
  });

  describe('remove', () => {
    it('should remove user', async () => {
      (userRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.remove('123');

      expect(userRepository.delete).toHaveBeenCalledWith('123');
    });

    it('should throw error if user not found', async () => {
      (userRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      await expect(service.remove('123')).rejects.toThrow(
        new BusinessException(ERROR_CODES.USER_NOT_FOUND),
      );
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      const mockUser = new User();
      mockUser.id = '123';
      mockUser.username = 'testuser';
      mockUser.password = 'password';

      const mockRole = new Role();
      mockRole.id = 'role1';
      mockRole.name = 'Test Role';

      const mockPermission = { id: 'perm1', name: 'user:create' };
      mockRole.permissions = [mockPermission];
      mockUser.roles = [mockRole];

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.hasPermission('123', 'user:create');
      expect(result).toBe(true);
    });

    it('should return false if user does not have permission', async () => {
      const mockUser = new User();
      mockUser.id = '123';
      mockUser.username = 'testuser';
      mockUser.password = 'password';
      mockUser.roles = [];

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.hasPermission('123', 'user:create');
      expect(result).toBe(false);
    });

    it('should return false if user does not exist', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.hasPermission('123', 'user:create');
      expect(result).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true if user has specified role', async () => {
      const mockUser = new User();
      mockUser.id = '123';
      mockUser.username = 'testuser';
      mockUser.password = 'password';

      const mockRole = new Role();
      mockRole.id = 'role1';
      mockRole.name = 'admin';
      mockUser.roles = [mockRole];

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.hasRole('123', ['admin']);
      expect(result).toBe(true);
    });

    it('should return false if user does not have specified role', async () => {
      const mockUser = new User();
      mockUser.id = '123';
      mockUser.username = 'testuser';
      mockUser.password = 'password';
      mockUser.roles = [];

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.hasRole('123', ['admin']);
      expect(result).toBe(false);
    });
  });

  describe('createInitialAdmin', () => {
    it('should create initial admin user if not exists', async () => {
      const mockSuperAdminRole = new Role();
      mockSuperAdminRole.id = 'super-admin-id';
      mockSuperAdminRole.name = 'Super Admin';
      mockSuperAdminRole.type = RoleType.SUPER_ADMIN;

      const mockUser = {
        ...new User(),
        id: 'new-admin-id',
        username: 'admin',
        password: 'hashedPassword',
        status: 'active',
      };

      (userRepository.findOne as jest.Mock).mockResolvedValueOnce(null); // 对应 findOne 方法调用
      (roleService.findByType as jest.Mock).mockResolvedValue(
        mockSuperAdminRole,
      );
      (roleService.findByIds as jest.Mock).mockResolvedValue([
        mockSuperAdminRole,
      ]);
      (userRepository.create as jest.Mock).mockReturnValue(mockUser);
      (userRepository.save as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.findOne as jest.Mock).mockResolvedValueOnce(mockUser); // 对应 create 方法中的 findOne 调用

      await service.createInitialAdmin();

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        username: 'admin',
      });
      expect(roleService.findByType).toHaveBeenCalledWith(RoleType.SUPER_ADMIN);
    });

    it('should not create admin if already exists', async () => {
      const mockExistingAdmin = new User();
      mockExistingAdmin.username = 'admin';

      (userRepository.findOne as jest.Mock).mockResolvedValue(
        mockExistingAdmin,
      );

      await service.createInitialAdmin();

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'admin' },
        relations: ['roles', 'roles.permissions'],
      });
      // 未调用 roleService.findByType，因为用户已存在
    });
  });
});
