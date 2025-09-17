---
trigger: manual
---
# 测试规范文档

## 重要说明

**接口响应规范**: 只要接口能正确调用，HTTP状态码都是200。业务处理错误主要通过业务码code来反馈，而不是使用HTTP状态码（如400、401、404等）。

## 概述

本文档为 mall-api 项目提供统一的测试编写规范和标准，确保新增功能的测试编写具有一致性、可维护性和可扩展性。所有测试都应遵循本规范。

## 1. 测试文件结构和命名规范

### 1.1 目录结构
```
test/
├── setup/                    # 测试设置和工具
│   ├── database.setup.ts    # 数据库连接和清理
│   ├── fixtures/           # 测试数据夹具
│   └── mocks/              # 模拟对象
├── modules/                # 业务模块测试
├── common/                # 通用功能测试
└── e2e/                   # 端到端测试
```

### 1.2 文件命名约定
- **单元测试**: `[文件名].spec.ts` (如: `user.service.spec.ts`)
- **端到端测试**: `[模块名].e2e-spec.ts` (如: `auth.e2e-spec.ts`)
- **集成测试**: `[模块名].integration-spec.ts`
- **夹具文件**: `[实体名].fixture.ts` (如: `users.fixture.ts`)
- **模拟文件**: `[功能名].mock.ts` (如: `auth.mock.ts`)

## 2. 测试用例设计原则

### 2.1 测试金字塔原则
- **70% 单元测试**: 测试单个函数或方法
- **20% 集成测试**: 测试模块间交互
- **10% 端到端测试**: 测试完整业务流程

### 2.2 测试用例结构
每个测试文件应包含：
```typescript
describe('模块名称', () => {
  // 前置条件设置
  beforeAll(() => {});
  beforeEach(() => {});
  
  // 测试用例组
  describe('功能场景', () => {
    it('应该执行什么操作并期望什么结果', () => {
      // 测试逻辑
    });
  });
  
  // 后置清理
  afterEach(() => {});
  afterAll(() => {});
});
```

## 3. 测试数据管理规范

### 3.1 测试数据创建
使用夹具工厂模式创建测试数据：
```typescript
// 在 fixtures/users.fixture.ts 中
export const createUserFixture = (overrides?: Partial<User>) => ({
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword',
  status: UserStatus.ACTIVE,
  ...overrides,
});
```

### 3.2 测试数据清理
每个测试用例结束后应清理测试数据：
```typescript
afterEach(async () => {
  await User.deleteMany({});
});
```

## 4. 断言编写规范

### 4.1 中文断言标准
所有断言描述必须使用中文，格式为：
```typescript
it('应该成功创建用户并返回code: 200', async () => {
  // 测试逻辑
  expect(response.body.code).toBe(200);
  expect(response.body.data.username).toBe('testuser');
});
```

### 4.2 断言最佳实践
- **明确性**: 断言描述应清晰表达期望行为
- **单一职责**: 每个测试用例只测试一个功能点
- **可读性**: 使用有意义的变量名和描述

## 5. 模拟和桩对象规范

### 5.1 外部依赖模拟
对于外部服务、数据库操作等，应使用模拟对象：
```typescript
// 在 mocks/auth.mock.ts 中
jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  })),
}));
```

### 5.2 模拟对象管理
- 集中管理模拟对象在 `test/setup/mocks/` 目录
- 避免在测试文件中直接内联模拟逻辑
- 定期审查和更新模拟对象

## 6. 数据库测试规范

### 6.1 测试数据库配置
- 使用独立的测试数据库: `mall-api-test`
- 测试前后自动清理数据
- 使用内存数据库或本地开发数据库

### 6.2 数据库操作测试
```typescript
it('应该将用户状态更新为禁用', async () => {
  const user = await userRepository.create(createUserFixture());
  await userService.disableUser(user._id);
  
  const updatedUser = await userRepository.findById(user._id);
  expect(updatedUser.status).toBe(UserStatus.DISABLED);
});
```

## 7. 错误处理和边界测试

### 7.1 错误场景测试
每个功能都应测试错误场景：
```typescript
it('当用户不存在时应该返回code: 3000错误', async () => {
  await expect(userService.getUserById('invalid-id'))
    .rejects
    .toThrow(new Error('USER_NOT_FOUND'));
});

it('当邮箱已存在时应该返回code: 3001错误', async () => {
  await userRepository.create(createUserFixture({ email: 'existing@example.com' }));
  
  await expect(userService.createUser({
    email: 'existing@example.com',
    username: 'newuser',
    password: 'password123'
  })).rejects.toThrow(new Error('USER_ALREADY_EXISTS'));
});
```

### 7.2 边界值测试
测试输入参数的边界条件：
```typescript
describe('用户名验证边界测试', () => {
  it('应该接受3个字符的用户名', () => {
    expect(validateUsername('abc')).toBe(true);
  });
  
  it('应该拒绝2个字符的用户名', () => {
    expect(validateUsername('ab')).toBe(false);
  });
});
```

## 8. 性能和安全测试

### 8.1 性能考虑
- 测试用例执行时间应小于100ms
- 避免在测试中进行耗时的IO操作
- 使用适当的超时设置

### 8.2 安全测试
```typescript
it('不应该在响应中返回密码字段', async () => {
  const response = await userService.getUserProfile('user-id');
  expect(response).not.toHaveProperty('password');
});

it('应该对密码进行哈希处理', async () => {
  const plainPassword = 'password123';
  const user = await userService.createUser({
    username: 'testuser',
    email: 'test@example.com',
    password: plainPassword
  });
  
  expect(user.password).not.toBe(plainPassword);
  expect(user.password).toHaveLength(60); // bcrypt哈希长度
});
```

## 9. 测试覆盖率要求

### 9.1 覆盖率目标
- **语句覆盖率**: ≥80%
- **分支覆盖率**: ≥70%
- **函数覆盖率**: ≥85%
- **行覆盖率**: ≥75%

### 9.2 覆盖率监控
在 `package.json` 中配置：
```json
{
  "scripts": {
    "test:cov": "jest --coverage",
    "test:cov:html": "jest --coverage --coverageReporters=html"
  }
}
```

## 10. 测试执行和报告

### 10.1 测试命令
```bash
# 运行所有测试
npm test

# 运行特定模块测试
npm test -- modules/user

# 运行覆盖率测试
npm run test:cov

# 监视模式运行测试
npm run test:watch
```

### 10.2 测试报告
- 使用Jest默认的测试报告格式
- 生成HTML覆盖率报告用于详细分析
- 集成到CI/CD流水线中

## 11. 新增功能测试流程

### 11.1 开发新功能时的测试流程
1. **分析需求**: 确定需要测试的功能点和边界条件
2. **设计测试用例**: 根据规范设计测试用例结构
3. **编写测试夹具**: 创建必要的测试数据工厂
4. **实现测试**: 遵循测试金字塔原则编写测试
5. **运行测试**: 确保所有测试通过
6. **审查覆盖率**: 检查测试覆盖率是否达标

### 11.2 示例：新增商品管理功能
```typescript
// test/modules/product/product.controller.spec.ts
describe('ProductController', () => {
  describe('POST /products', () => {
    it('应该成功创建商品并返回code: 200', async () => {
      // 测试逻辑
    });
    
    it('当价格无效时应该返回code: 9007错误', async () => {
      // 测试逻辑
    });
  });
  
  describe('GET /products/:id', () => {
    it('应该返回指定商品的详细信息', async () => {
      // 测试逻辑
    });
  });
});
```

## 12. 维护和更新规范

### 12.1 规范审查
- 每季度审查一次测试规范
- 根据项目演进更新最佳实践
- 收集团队反馈持续改进

### 12.2 变更管理
- 重大规范变更需要团队讨论
- 更新规范文档并通知所有成员
- 提供迁移指南和示例

## 附录：常用测试模式

### A. 测试数据构建器模式
```typescript
class UserBuilder {
  private user: Partial<User> = {};
  
  withUsername(username: string): UserBuilder {
    this.user.username = username;
    return this;
  }
  
  withEmail(email: string): UserBuilder {
    this.user.email = email;
    return this;
  }
  
  build(): User {
    return { ...defaultUser, ...this.user } as User;
  }
}
```

### B. 测试工具函数
```typescript
// test/utils/test-utils.ts
export const setupTestDB = async () => {
  await connect(process.env.DATABASE_URL);
};

export const cleanupTestDB = async () => {
  await connection.db.dropDatabase();
  await connection.close();
};

export const createTestApp = async (module: any) => {
  return Test.createTestingModule({
    imports: [module],
  }).compile();
};
```

---

**最后更新**: 2025-09-17  
**维护者**: 开发团队  
**版本**: v1.0.0