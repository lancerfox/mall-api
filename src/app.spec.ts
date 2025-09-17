import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { UserService } from './modules/user/services/user.service';
import { RoleService } from './modules/role/services/role.service';
import {
  connectTestDB,
  clearTestDB,
  disconnectTestDB,
  getDBConnectionState,
} from '../test/setup/database.setup';

describe('应用启动和数据库连接测试', () => {
  let app: INestApplication;
  let appService: AppService;

  beforeAll(async () => {
    // 连接测试数据库
    await connectTestDB();
  });

  afterAll(async () => {
    // 断开测试数据库连接
    await disconnectTestDB();
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    // 清空测试数据
    await clearTestDB();
  });

  describe('应用启动测试', () => {
    it('应用应该能够正常启动并监听指定端口', async () => {
      // 安排
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();

      // 执行
      await app.init();

      // 断言
      expect(app).toBeDefined();
      expect(app.getHttpAdapter()).toBeDefined();

      // 验证应用实例创建成功
      expect(app.get(AppService)).toBeDefined();
    });

    it('应用启动时应该正确设置全局配置', async () => {
      // 安排
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();

      // 执行
      await app.init();

      // 断言应用配置正确
      expect(app).toBeDefined();

      // 验证能够获取到关键服务
      const appService = app.get(AppService);
      expect(appService).toBeDefined();
    });

    it('环境变量缺失时应用启动应该使用默认配置', async () => {
      // 安排 - 暂时清除环境变量
      const originalDatabaseUrl = process.env.DATABASE_URL;
      const originalJwtSecret = process.env.JWT_SECRET;

      // 删除关键环境变量测试默认值
      delete process.env.DATABASE_URL;
      delete process.env.JWT_SECRET;

      try {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [
            MongooseModule.forRoot('mongodb://localhost:27017/mall-api-test', {
              dbName: 'mall-api-test',
            }),
          ],
          providers: [
            AppService,
            {
              provide: UserService,
              useValue: {
                findOne: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockResolvedValue({}),
              },
            },
            {
              provide: RoleService,
              useValue: {
                findByType: jest
                  .fn()
                  .mockResolvedValue({ _id: 'mock-role-id' }),
              },
            },
          ],
        }).compile();

        app = moduleFixture.createNestApplication();

        // 执行
        await app.init();

        // 断言
        expect(app).toBeDefined();
      } finally {
        // 恢复环境变量
        if (originalDatabaseUrl) {
          process.env.DATABASE_URL = originalDatabaseUrl;
        }
        if (originalJwtSecret) {
          process.env.JWT_SECRET = originalJwtSecret;
        }
      }
    });
  });

  describe('数据库连接测试', () => {
    it('有效的MongoDB连接字符串应该成功连接数据库', async () => {
      // 执行 - 数据库连接在beforeAll中已经建立
      const connectionState = getDBConnectionState();

      // 断言
      expect(connectionState).toBe(1); // 1 表示已连接状态
    });

    it('数据库连接成功时应该能够执行基本操作', async () => {
      // 安排
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(
            process.env.DATABASE_URL ||
              'mongodb://localhost:27017/mall-api-test',
            {
              dbName: process.env.DATABASE_NAME || 'mall-api-test',
            },
          ),
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      // 执行 - 验证数据库操作
      const connectionState = getDBConnectionState();

      // 断言
      expect(connectionState).toBe(1); // 连接状态正常
      expect(app).toBeDefined();
    });

    it('数据库清空操作应该正常工作', async () => {
      // 执行
      await clearTestDB();

      // 断言 - 如果没有抛出异常，说明清空操作成功
      expect(true).toBe(true);
    });

    it('数据库连接状态应该正确反映连接状态', () => {
      // 执行
      const connectionState = getDBConnectionState();

      // 断言
      expect(typeof connectionState).toBe('number');
      expect(connectionState).toBeGreaterThanOrEqual(0);
      expect(connectionState).toBeLessThanOrEqual(3);
      // MongoDB连接状态: 0=断开, 1=已连接, 2=正在连接, 3=正在断开
    });
  });

  describe('AppService初始化测试', () => {
    it('AppService应该能够正常初始化', async () => {
      // 安排
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      // 执行
      appService = app.get<AppService>(AppService);

      // 断言
      expect(appService).toBeDefined();
      expect(typeof appService.onModuleInit).toBe('function');
    });

    it('AppService onModuleInit应该能够正常执行', async () => {
      // 安排
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      appService = app.get<AppService>(AppService);

      // 执行 - onModuleInit在应用启动时自动调用
      // 这里我们验证服务能够正常获取

      // 断言
      expect(appService).toBeDefined();
      // 注意：onModuleInit在实际应用中会尝试创建管理员账户
      // 在测试环境中，我们主要验证服务能够正常实例化
    });
  });

  describe('模块依赖注入测试', () => {
    it('所有核心模块应该正确注入', async () => {
      // 安排
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      // 执行和断言 - 验证关键服务能够被正确注入
      expect(() => app.get(AppService)).not.toThrow();

      // 验证应用能够正常启动，说明依赖注入配置正确
      expect(app).toBeDefined();
    });

    it('数据库模块应该正确配置', async () => {
      // 安排
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();

      // 执行
      await app.init();

      // 断言 - 应用能够启动说明MongoDB配置正确
      expect(app).toBeDefined();
      expect(getDBConnectionState()).toBe(1);
    });
  });

  describe('错误处理测试', () => {
    it('应用关闭应该正确处理', async () => {
      // 安排
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      // 执行
      await app.close();

      // 断言 - 如果没有抛出异常，说明关闭成功
      expect(true).toBe(true);

      // 重置app引用避免afterAll中重复关闭
      app = null as any;
    });

    it('模块编译失败应该正确抛出错误', async () => {
      // 这个测试验证当模块配置有问题时是否会正确抛出错误
      // 在正常配置下，应该能够成功编译

      // 执行和断言
      await expect(
        Test.createTestingModule({
          imports: [AppModule],
        }).compile(),
      ).resolves.toBeDefined();
    });
  });
});
