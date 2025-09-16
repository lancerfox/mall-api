import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { UserService } from '../services/user.service';
import { RoleService } from '../../role/services/role.service';
import { User, UserDocument } from '../entities/user.entity';
import { Role, RoleDocument } from '../../role/entities/role.entity';
import { RoleType } from '../../../common/enums/role-type.enum';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<UserDocument>;
  let roleService: RoleService;

  // Mock user model
  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const mockRoleService = {
    findByIds: jest.fn(),
    findByType: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    roleService = module.get<RoleService>(RoleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne - 根据用户名查找用户', () => {
    it('应该通过用户名返回用户', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        username: 'testuser',
        password: 'hashedpassword',
        roles: [],
      } as UserDocument;

      mockUserModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      const result = await service.findOne('testuser');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        username: 'testuser',
      });
    });

    it('当用户未找到时应返回null', async () => {
      mockUserModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findById - 根据ID查找用户', () => {
    it('应该通过ID返回用户', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        username: 'testuser',
        password: 'hashedpassword',
        roles: [],
        toObject: jest.fn().mockReturnValue({
          _id: new Types.ObjectId(),
          username: 'testuser',
          roles: [],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as unknown as UserDocument;

      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUser),
          }),
        }),
      });

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(result).toBeDefined();
      expect(result?.username).toBe('testuser');
    });

    it('当用户未找到时应返回null', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create - 创建用户', () => {
    it('应该成功创建用户', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
        roles: ['507f1f77bcf86cd799439011'],
      };

      const mockRole = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        name: 'admin',
        type: RoleType.ADMIN,
      } as RoleDocument;

      const mockUser = {
        _id: new Types.ObjectId(),
        username: 'newuser',
        password: 'hashedpassword',
        roles: [mockRole],
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: new Types.ObjectId(),
          username: 'newuser',
          roles: [mockRole],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as unknown as UserDocument;

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockRoleService.findByIds.mockResolvedValue([mockRole]);
      mockUserModel.create.mockReturnValue(mockUser);
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUser),
          }),
        }),
      });

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.username).toBe('newuser');
      expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto);
    });

    it('当用户名已存在时应抛出ConflictException', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        password: 'password123',
        roles: [],
      };

      const existingUser = {
        _id: new Types.ObjectId(),
        username: 'existinguser',
      } as UserDocument;

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingUser),
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        new HttpException('用户名已存在', HttpStatus.CONFLICT),
      );
    });

    it('当角色不存在时应抛出BadRequestException', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
        roles: ['507f1f77bcf86cd799439011'],
      };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockRoleService.findByIds.mockResolvedValue([]);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new HttpException('部分角色不存在', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('findAll - 获取用户列表', () => {
    it('应该返回分页的用户列表', async () => {
      const query: QueryUserDto = {
        page: 1,
        pageSize: 10,
      };

      const mockUsers = [
        {
          _id: new Types.ObjectId(),
          username: 'user1',
          roles: [],
          toObject: jest.fn().mockReturnValue({
            _id: new Types.ObjectId(),
            username: 'user1',
            roles: [],
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        },
        {
          _id: new Types.ObjectId(),
          username: 'user2',
          roles: [],
          toObject: jest.fn().mockReturnValue({
            _id: new Types.ObjectId(),
            username: 'user2',
            roles: [],
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        },
      ] as unknown as UserDocument[];

      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  exec: jest.fn().mockResolvedValue(mockUsers),
                }),
              }),
            }),
          }),
        }),
      });

      mockUserModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const result = await service.findAll(query);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('应该支持用户名搜索', async () => {
      const query: QueryUserDto = {
        page: 1,
        pageSize: 10,
        username: 'test',
      };

      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  exec: jest.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }),
        }),
      });

      mockUserModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findAll(query);

      expect(mockUserModel.find).toHaveBeenCalledWith({
        username: { $regex: 'test', $options: 'i' },
      });
    });
  });

  describe('update - 更新用户', () => {
    it('应该成功更新用户信息', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        username: 'updateduser',
        roles: ['507f1f77bcf86cd799439012'],
      };

      const existingUser = {
        _id: new Types.ObjectId(userId),
        username: 'olduser',
      } as UserDocument;

      const mockRole = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
        name: 'admin',
        type: RoleType.ADMIN,
      } as RoleDocument;

      const updatedUser = {
        _id: new Types.ObjectId(userId),
        username: 'updateduser',
        roles: [mockRole],
        toObject: jest.fn().mockReturnValue({
          _id: new Types.ObjectId(userId),
          username: 'updateduser',
          roles: [mockRole],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as unknown as UserDocument;

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingUser),
      });
      mockRoleService.findByIds.mockResolvedValue([mockRole]);
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(updatedUser),
          }),
        }),
      });

      const result = await service.update(userId, updateUserDto);

      expect(result).toBeDefined();
      expect(result.username).toBe('updateduser');
    });

    it('当用户不存在时应抛出NotFoundException', async () => {
      const userId = 'nonexistent';
      const updateUserDto: UpdateUserDto = {
        username: 'updateduser',
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        new HttpException('用户不存在', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('remove - 删除用户', () => {
    it('应该成功删除用户', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = {
        _id: new Types.ObjectId(userId),
        username: 'todelete',
      } as UserDocument;

      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(service.remove(userId)).resolves.not.toThrow();
    });

    it('当用户不存在时应抛出NotFoundException', async () => {
      const userId = 'nonexistent';
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(userId)).rejects.toThrow(
        new HttpException('用户不存在', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('updateLastLogin - 更新最后登录信息', () => {
    it('应该更新最后登录时间和IP', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const ip = '192.168.1.1';

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      await service.updateLastLogin(userId, ip);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        lastLoginTime: expect.any(Date),
        lastLoginIp: ip,
      });
    });
  });

  describe('hasPermission - 检查用户权限', () => {
    it('应该返回用户是否有指定权限', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const permission = 'user:read';

      const mockUser = {
        _id: new Types.ObjectId(userId),
        username: 'testuser',
        roles: [
          {
            _id: new Types.ObjectId(),
            name: 'admin',
            permissions: ['user:read', 'user:write'],
          },
        ],
      } as unknown as UserDocument;

      mockUserModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      const result = await service.hasPermission(userId, permission);

      expect(result).toBe(true);
    });

    it('当用户不存在时应返回false', async () => {
      const userId = 'nonexistent';
      const permission = 'user:read';

      mockUserModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await service.hasPermission(userId, permission);

      expect(result).toBe(false);
    });
  });

  describe('generateRandomPassword - 生成随机密码', () => {
    it('应该生成指定长度的随机密码', () => {
      const password = service.generateRandomPassword(12);

      expect(password).toHaveLength(12);
      expect(password).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('默认长度应为8位', () => {
      const password = service.generateRandomPassword();

      expect(password).toHaveLength(8);
    });
  });

  describe('createInitialAdmin - 创建初始管理员', () => {
    it('当管理员已存在时应跳过创建', async () => {
      const existingAdmin = {
        _id: new Types.ObjectId(),
        username: 'admin',
      } as UserDocument;

      mockUserModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(existingAdmin),
        }),
      });

      await service.createInitialAdmin();

      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    it('当超级管理员角色不存在时应记录错误', async () => {
      mockUserModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });
      mockRoleService.findByType.mockResolvedValue(null);

      await service.createInitialAdmin();

      expect(mockUserModel.create).not.toHaveBeenCalled();
    });
  });
});
