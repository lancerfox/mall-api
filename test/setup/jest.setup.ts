import { connectTestDB, clearTestDB, disconnectTestDB } from './database.setup';
import { ensureRBACInitialized } from './rbac-setup';

// 全局测试超时设置
jest.setTimeout(30000);

// 在所有测试之前运行
beforeAll(async () => {
  console.log('正在连接测试数据库...');
  await connectTestDB();

  // 确保RBAC系统已初始化
  console.log('正在检查RBAC系统状态...');
  await ensureRBACInitialized();
});

// 在每个测试之后运行
afterEach(async () => {
  if (process.env.TEST_DB_CLEANUP === 'true') {
    await clearTestDB();
  }
});

// 在所有测试之后运行
afterAll(async () => {
  console.log('正在断开测试数据库连接...');
  await disconnectTestDB();
});
