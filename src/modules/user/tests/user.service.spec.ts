import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException } from '@nestjs/common';
import { Model, Query } from 'mongoose';
import { UserService } from '../services/user.service';
import { User, UserDocument } from '../entities/user.entity';
import { RoleService } from '../../role/services/role.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { RoleType } from '../../../common/enums/role-type.enum';

describe('UserService', () => {
  let service: UserService;
  let userModel: jest.Mocked<Model<UserDocument>>;
  let roleService: jest.Mocked<RoleService>;

  // 模拟用户数据
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    password: '$2b$10$hashedpassword',
    roles: [
      {
        _id: '507f1f77bcf86cd799439012',
        name: '普通用户',
        type: 'USER',
        permissions: [{ name: 'user:read' }, { name: 'user:write' }],
      },
    ],
    status: 'active',
    avatar: '',
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      username: 'testuser',
      roles: [
        {
          _id: '507f1f77bcf86cd799439012',
          name: '普通用户',
          type: 'USER',
          permissions: [{ name: 'user:read' }, { name: 'user:write' }],
        },
      ],
      status: 'active',
      avatar: '',
      lastLoginTime: new Date(),
      lastLoginIp: '127.0.0.1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    save: jest.fn(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockReturnThis(),
  };

  const mockUserResponseDto = {
    id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    roles: [
      {
        id: '507f1f77bcf86cd799439012',
        name: '普通用户',
        type: 'USER',
      },
    ],
    status: 'active',
    avatar: '',
    permissions: ['user:read', 'user:write'],
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isSuperAdmin: false,
  };

  // Mock Query类型
  const createMockQuery = (returnValue?: any) => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(returnValue),
    };
    return mockQuery as any;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            find: jest.fn(),
            countDocuments: jest.fn(),
            create: jest.fn(),
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
    userModel = module.get(getModelToken(User.name));
    roleService = module.get(RoleService);

    // 重置所有mock
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('应该根据用户名成功查找用户', async () => {
      // 安排
      const username = 'testuser';
      const mockQuery = createMockQuery(mockUser);
      userModel.findOne.mockReturnValue(mockQuery);

      // 执行
      const result = await service.findOne(username);

      // 断言
      expect(result).toEqual(mockUser);
      expect(userModel.findOne).toHaveBeenCalledWith({ username });
    });

    it('用户不存在时应该返回null', async () => {
      // 安排
      const username = 'nonexistent';
      const mockQuery = createMockQuery(null);
      userModel.findOne.mockReturnValue(mockQuery);

      // 执行
      const result = await service.findOne(username);

      // 断言
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('应该根据ID成功查找用户', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const mockQuery = createMockQuery(mockUser);
      userModel.findById.mockReturnValue(mockQuery);

      // 执行
      const result = await service.findById(userId);

      // 断言
      expect(result).toBeDefined();
      expect(result?.id).toBe(userId);
      expect(userModel.findById).toHaveBeenCalledWith(userId);
    });

    it('用户不存在时应该返回null', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const mockQuery = createMockQuery(null);
      userModel.findById.mockReturnValue(mockQuery);

      // 执行
      const result = await service.findById(userId);

      // 断言
      expect(result).toBeNull();
    });

    it('查询出错时应该返回null', async () => {
      // 安排
      const userId = 'invalid-id';
      const mockQuery = createMockQuery();
      mockQuery.exec.mockRejectedValue(new Error('Database error'));
      userModel.findById.mockReturnValue(mockQuery);

      // 执行
      const result = await service.findById(userId);

      // 断言
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('应该成功创建用户', async () => {
      // 安排
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
        roles: ['507f1f77bcf86cd799439012'],
      };

      const mockRole = { _id: '507f1f77bcf86cd799439012', name: '普通用户' };
      const savedUser = { ...mockUser, _id: '507f1f77bcf86cd799439013' };

      userModel.findOne.mockReturnValue(createMockQuery(null)); // 用户名不存在
      roleService.findByIds.mockResolvedValue([mockRole] as any);
      userModel.create.mockResolvedValue(savedUser as any);
      userModel.findById.mockReturnValue(createMockQuery(savedUser));

      // 执行
      const result = await service.create(createUserDto);

      // 断言
      expect(result).toBeDefined();
      expect(userModel.create).toHaveBeenCalledWith(createUserDto);
      expect(roleService.findByIds).toHaveBeenCalledWith(createUserDto.roles);
    });

    it('用户名已存在时应该抛出用户已存在错误', async () => {
      // 安排
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        password: 'password123',
        roles: [],
      };

      userModel.findOne.mockReturnValue(createMockQuery(mockUser));

      // 执行和断言
      await expect(service.create(createUserDto)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.create(createUserDto);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.USER_ALREADY_EXISTS,
        );
      }
    });

    it('角色不存在时应该抛出角色不存在错误', async () => {
      // 安排
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
        roles: ['invalid-role-id'],
      };

      userModel.findOne.mockReturnValue(createMockQuery(null));
      roleService.findByIds.mockResolvedValue([]); // 角色不存在

      // 执行和断言
      await expect(service.create(createUserDto)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.create(createUserDto);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.ROLE_NOT_FOUND,
        );
      }
    });
  });

  describe('update', () => {
    it('应该成功更新用户信息', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        status: 'active',
        roles: ['507f1f77bcf86cd799439012'],
      };

      const mockRole = { _id: '507f1f77bcf86cd799439012', name: '普通用户' };
      const updatedUser = { ...mockUser, username: 'updateduser' };

      userModel.findById.mockReturnValue(createMockQuery(mockUser));
      roleService.findByIds.mockResolvedValue([mockRole] as any);
      userModel.findByIdAndUpdate.mockReturnValue(createMockQuery(updatedUser));

      // 执行
      const result = await service.update(userId, updateUserDto);

      // 断言
      expect(result).toBeDefined();
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateUserDto,
        { new: true },
      );
    });

    it('用户不存在时应该抛出用户不存在错误', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        status: 'active',
      };

      userModel.findById.mockReturnValue(createMockQuery(null));

      // 执行和断言
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.update(userId, updateUserDto);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.USER_NOT_FOUND,
        );
      }
    });

    it('更新失败时应该抛出验证失败错误', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        status: 'inactive',
      };

      userModel.findById.mockReturnValue(createMockQuery(mockUser));
      userModel.findByIdAndUpdate.mockReturnValue(createMockQuery(null));

      // 执行和断言
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.update(userId, updateUserDto);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.VALIDATION_FAILED,
        );
      }
    });
  });

  describe('remove', () => {
    it('应该成功删除用户', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      userModel.findByIdAndDelete.mockReturnValue(createMockQuery(mockUser));

      // 执行
      await service.remove(userId);

      // 断言
      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });

    it('用户不存在时应该抛出用户不存在错误', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      userModel.findByIdAndDelete.mockReturnValue(createMockQuery(null));

      // 执行和断言
      await expect(service.remove(userId)).rejects.toThrow(HttpException);

      try {
        await service.remove(userId);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.USER_NOT_FOUND,
        );
      }
    });
  });

  describe('updateLastLogin', () => {
    it('应该成功更新最后登录时间', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const ip = '192.168.1.1';
      userModel.findByIdAndUpdate.mockReturnValue(createMockQuery(mockUser));

      // 执行
      await service.updateLastLogin(userId, ip);

      // 断言
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          lastLoginTime: expect.any(Date),
          lastLoginIp: ip,
        }),
      );
    });

    it('没有IP地址时应该只更新登录时间', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      userModel.findByIdAndUpdate.mockReturnValue(createMockQuery(mockUser));

      // 执行
      await service.updateLastLogin(userId);

      // 断言
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          lastLoginTime: expect.any(Date),
        }),
      );
    });
  });

  describe('updatePassword', () => {
    it('应该成功更新用户密码', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const newPassword = 'newpassword123';
      const userDoc = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(mockUser),
      };

      userModel.findById.mockReturnValue(createMockQuery(userDoc));

      // 执行
      await service.updatePassword(userId, newPassword);

      // 断言
      expect(userDoc.password).toBe(newPassword);
      expect(userDoc.save).toHaveBeenCalled();
    });

    it('用户不存在时应该抛出用户不存在错误', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const newPassword = 'newpassword123';

      userModel.findById.mockReturnValue(createMockQuery(null));

      // 执行和断言
      await expect(service.updatePassword(userId, newPassword)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.updatePassword(userId, newPassword);
      } catch (error) {
        // 检查业务错误码，而不是HTTP状态码
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.USER_NOT_FOUND,
        );
      }
    });
  });

  describe('findAll', () => {
    it('应该成功获取用户列表', async () => {
      // 安排
      const query: QueryUserDto = {
        page: 1,
        pageSize: 10,
        username: 'test',
      };

      const mockUsers = [mockUser];
      const totalCount = 1;

      userModel.find.mockReturnValue(createMockQuery(mockUsers));
      userModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(totalCount),
      } as any);

      // 执行
      const result = await service.findAll(query);

      // 断言
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(totalCount);
      expect(result.page).toBe(query.page);
      expect(result.pageSize).toBe(query.pageSize);
    });

    it('应该正确处理搜索和筛选条件', async () => {
      // 安排
      const query: QueryUserDto = {
        page: 1,
        pageSize: 10,
        username: 'test',
        status: 'active' as any,
        roles: '507f1f77bcf86cd799439012',
      };

      userModel.find.mockReturnValue(createMockQuery([]));
      userModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      } as any);

      // 执行
      await service.findAll(query);

      // 断言
      expect(userModel.find).toHaveBeenCalledWith({
        username: { $regex: 'test', $options: 'i' },
        status: 'active',
        roles: '507f1f77bcf86cd799439012',
      });
    });
  });

  describe('hasPermission', () => {
    it('用户有权限时应该返回true', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const permission = 'user:read';

      userModel.findById.mockReturnValue(createMockQuery(mockUser));

      // 执行
      const result = await service.hasPermission(userId, permission);

      // 断言
      expect(result).toBe(true);
    });

    it('用户没有权限时应该返回false', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const permission = 'admin:write';

      userModel.findById.mockReturnValue(createMockQuery(mockUser));

      // 执行
      const result = await service.hasPermission(userId, permission);

      // 断言
      expect(result).toBe(false);
    });

    it('用户不存在时应该返回false', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const permission = 'user:read';

      userModel.findById.mockReturnValue(createMockQuery(null));

      // 执行
      const result = await service.hasPermission(userId, permission);

      // 断言
      expect(result).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('用户有角色时应该返回true', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const roleNames = ['普通用户'];

      userModel.findById.mockReturnValue(createMockQuery(mockUser));

      // 执行
      const result = await service.hasRole(userId, roleNames);

      // 断言
      expect(result).toBe(true);
    });

    it('用户没有角色时应该返回false', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const roleNames = ['管理员'];

      userModel.findById.mockReturnValue(createMockQuery(mockUser));

      // 执行
      const result = await service.hasRole(userId, roleNames);

      // 断言
      expect(result).toBe(false);
    });

    it('用户不存在时应该返回false', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const roleNames = ['普通用户'];

      userModel.findById.mockReturnValue(createMockQuery(null));

      // 执行
      const result = await service.hasRole(userId, roleNames);

      // 断言
      expect(result).toBe(false);
    });
  });

  describe('generateRandomPassword', () => {
    it('应该生成指定长度的随机密码', () => {
      // 执行
      const password1 = service.generateRandomPassword(8);
      const password2 = service.generateRandomPassword(12);

      // 断言
      expect(password1).toHaveLength(8);
      expect(password2).toHaveLength(12);
      expect(password1).not.toBe(password2); // 随机性检查
    });

    it('应该生成默认长度的密码', () => {
      // 执行
      const password = service.generateRandomPassword();

      // 断言
      expect(password).toHaveLength(8); // 默认长度
    });
  });

  describe('getUserPermissions', () => {
    it('应该正确提取用户权限', () => {
      // 执行
      const permissions = service.getUserPermissions(mockUser as any);

      // 断言
      expect(permissions).toContain('user:read');
      expect(permissions).toContain('user:write');
      expect(permissions).toHaveLength(2);
    });

    it('没有角色时应该返回空数组', () => {
      // 安排
      const userWithoutRoles = { ...mockUser, roles: [] };

      // 执行
      const permissions = service.getUserPermissions(userWithoutRoles as any);

      // 断言
      expect(permissions).toEqual([]);
    });
  });

  describe('getUserMenus', () => {
    it('应该成功获取用户菜单', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';

      userModel.findById.mockReturnValue(createMockQuery(mockUser));

      // 执行
      const result = await service.getUserMenus(userId);

      // 断言
      expect(result).toBeDefined();
      expect(result.permissions).toContain('user:read');
      expect(result.menus).toBeDefined();
      expect(Array.isArray(result.menus)).toBe(true);
    });

    it('用户不存在时应该抛出用户不存在错误', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';

      userModel.findById.mockReturnValue(createMockQuery(null));

      // 执行和断言
      await expect(service.getUserMenus(userId)).rejects.toThrow(HttpException);

      try {
        await service.getUserMenus(userId);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.USER_NOT_FOUND,
        );
      }
    });
  });

  describe('updateProfile', () => {
    it('应该成功更新用户资料', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const updateData = { avatar: 'new-avatar.jpg' };
      const updatedUser = { ...mockUser, avatar: 'new-avatar.jpg' };

      userModel.findByIdAndUpdate.mockReturnValue(createMockQuery(updatedUser));

      // 执行
      const result = await service.updateProfile(userId, updateData);

      // 断言
      expect(result).toBeDefined();
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateData,
        { new: true },
      );
    });

    it('用户不存在时应该抛出用户不存在错误', async () => {
      // 安排
      const userId = '507f1f77bcf86cd799439011';
      const updateData = { avatar: 'new-avatar.jpg' };

      userModel.findByIdAndUpdate.mockReturnValue(createMockQuery(null));

      // 执行和断言
      await expect(service.updateProfile(userId, updateData)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.updateProfile(userId, updateData);
      } catch (error) {
        expect((error as HttpException).getStatus()).toBe(
          ERROR_CODES.USER_NOT_FOUND,
        );
      }
    });
  });

  describe('transformUserToResponse', () => {
    it('应该正确转换用户文档为响应格式', () => {
      // 执行
      const result = service.transformUserToResponse(mockUser as any);

      // 断言
      expect(result).toBeDefined();
      expect(result.id).toBe('507f1f77bcf86cd799439011');
      expect(result.username).toBe('testuser');
      expect(result.roles).toHaveLength(1);
      expect(result.permissions).toContain('user:read');
      expect(result.isSuperAdmin).toBe(false);
    });

    it('超级管理员应该被正确标识', () => {
      // 安排
      const superAdminUser = {
        ...mockUser,
        roles: [
          {
            _id: '507f1f77bcf86cd799439012',
            name: '超级管理员',
            type: RoleType.SUPER_ADMIN,
            permissions: [],
          },
        ],
        toObject: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439011',
          username: 'admin',
          roles: [
            {
              _id: '507f1f77bcf86cd799439012',
              name: '超级管理员',
              type: RoleType.SUPER_ADMIN,
              permissions: [],
            },
          ],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      // 执行
      const result = service.transformUserToResponse(superAdminUser as any);

      // 断言
      expect(result.isSuperAdmin).toBe(true);
    });
  });
});
