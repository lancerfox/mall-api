import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../src/app.service';
import { UserService } from '../src/modules/user/services/user.service';

describe('AppService', () => {
  let service: AppService;
  let userService: jest.Mocked<UserService>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'admin',
    email: 'admin@example.com',
    realName: '管理员',
    role: 'admin',
    status: 'active',
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUserService = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const result = service.getHello();
      expect(result).toBe('Hello World!');
    });
  });

  describe('onModuleInit', () => {
    it('should create admin user if not exists', async () => {
      userService.findOne.mockResolvedValue(null);
      userService.create.mockResolvedValue(mockUser as any);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.onModuleInit();

      expect(userService.findOne).toHaveBeenCalledWith('admin');
      expect(userService.create).toHaveBeenCalledWith('admin', 'admin');
      expect(consoleSpy).toHaveBeenCalledWith(
        '初始管理员账户创建成功: admin/admin',
      );

      consoleSpy.mockRestore();
    });

    it('should not create admin user if already exists', async () => {
      userService.findOne.mockResolvedValue(mockUser as any);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.onModuleInit();

      expect(userService.findOne).toHaveBeenCalledWith('admin');
      expect(userService.create).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('管理员账户已存在');

      consoleSpy.mockRestore();
    });

    it('should handle errors when creating admin user', async () => {
      userService.findOne.mockResolvedValue(null);
      userService.create.mockRejectedValue(new Error('Database error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.onModuleInit();

      expect(userService.findOne).toHaveBeenCalledWith('admin');
      expect(userService.create).toHaveBeenCalledWith('admin', 'admin');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '创建初始管理员账户失败:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle errors when checking existing admin user', async () => {
      userService.findOne.mockRejectedValue(
        new Error('Database connection error'),
      );
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.onModuleInit();

      expect(userService.findOne).toHaveBeenCalledWith('admin');
      expect(userService.create).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '创建初始管理员账户失败:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
