import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { UserService } from '../../user/services/user.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { ERROR_CODES } from '../../../common/constants/error-codes';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userService: jest.Mocked<UserService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userService = module.get(UserService);
    configService = module.get(ConfigService);

    // Mock config values
    configService.get.mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'test-secret';
      }
      return null;
    });
  });

  describe('validate', () => {
    it('应该验证有效的JWT载荷', async () => {
      // 安排
      const mockPayload = {
        username: 'testuser',
        sub: '1',
        role: 'admin',
      };

      const mockUser = {
        id: '1',
        username: 'testuser',
        status: 'active',
        roles: [{ name: 'admin' }],
      };

      userService.findById.mockResolvedValue(mockUser);

      // 执行
      const result = await jwtStrategy.validate(mockPayload);

      // 断言
      expect(result).toEqual({
        sub: '1',
        userId: '1',
        username: 'testuser',
        role: 'admin',
        id: '1',
      });
      expect(userService.findById).toHaveBeenCalledWith('1');
    });

    it('应该在用户不存在时抛出异常', async () => {
      // 安排
      const mockPayload = {
        username: 'nonexistent',
        sub: '999',
        role: 'user',
      };

      userService.findById.mockResolvedValue(null);

      // 执行和断言
      await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(
        new UnauthorizedException({
          message: '用户不存在',
          errorCode: ERROR_CODES.USER_NOT_FOUND,
        }),
      );
    });

    it('应该在用户状态非active时抛出异常', async () => {
      // 安排
      const mockPayload = {
        username: 'testuser',
        sub: '1',
        role: 'user',
      };

      const mockUser = {
        id: '1',
        username: 'testuser',
        status: 'locked', // 非active状态
      };

      userService.findById.mockResolvedValue(mockUser);

      // 执行和断言
      await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(
        new UnauthorizedException({
          message: '用户账户已被禁用',
          errorCode: ERROR_CODES.ACCOUNT_DISABLED,
        }),
      );
    });

    it('应该处理inactive状态用户', async () => {
      // 安排
      const mockPayload = {
        username: 'testuser',
        sub: '1',
        role: 'user',
      };

      const mockUser = {
        id: '1',
        username: 'testuser',
        status: 'inactive',
      };

      userService.findById.mockResolvedValue(mockUser);

      // 执行和断言
      await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(
        new UnauthorizedException({
          message: '用户账户已被禁用',
          errorCode: ERROR_CODES.ACCOUNT_DISABLED,
        }),
      );
    });
  });

  describe('constructor', () => {
    it('应该正确配置JWT策略', () => {
      // 断言 - 检查策略配置
      expect(jwtStrategy).toBeDefined();
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });
  });
});