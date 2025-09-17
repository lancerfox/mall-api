# 单元测试运行指南

本项目基于您提供的单元测试用例文档，已完成了完整的单元测试体系的搭建。

## 📁 测试文件结构

```
mall-api/
├── test/
│   └── setup/
│       ├── database.setup.ts     # 数据库连接配置
│       ├── jest.setup.ts          # Jest全局设置
│       └── fixtures/              # 测试数据夹具
│           ├── users.fixture.ts
│           └── roles.fixture.ts
├── src/
│   ├── app.spec.ts               # 应用启动和数据库连接测试
│   └── modules/
│       ├── auth/
│       │   ├── services/
│       │   │   └── auth.service.spec.ts     # 认证服务测试
│       │   └── controllers/
│       │       └── auth.controller.spec.ts   # 认证控制器测试
│       └── user/
│           ├── services/
│           │   └── user.service.spec.ts     # 用户服务测试
│           └── controllers/
│               └── user.controller.spec.ts   # 用户控制器测试
├── scripts/
│   └── test-setup.js             # 测试环境设置脚本
├── .env.test                     # 测试环境变量
└── package.json                  # 更新的Jest配置
```

## 🚀 快速开始

### 1. 环境准备

确保MongoDB服务运行：
```bash
# macOS (使用 Homebrew)
brew services start mongodb-community@6.0

# 或直接启动
mongod --config /usr/local/etc/mongod.conf
```

### 2. 设置测试环境

运行测试环境设置脚本：
```bash
node scripts/test-setup.js
```

### 3. 安装依赖

```bash
npm install
```

### 4. 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:cov

# 监视模式运行测试（开发时使用）
npm run test:watch

# 运行特定模块的测试
npm test -- --testPathPattern="src/modules/auth"

# 运行特定测试文件
npm test auth.service.spec.ts

# 运行端到端测试
npm run test:e2e
```

## 📋 已实现的测试用例

### ✅ 应用启动和数据库连接测试
- [x] 应用正常启动测试
- [x] 数据库连接成功测试
- [x] 环境变量配置测试
- [x] 模块依赖注入测试
- [x] 错误处理测试

### ✅ 认证模块测试

#### AuthService 测试
- [x] 用户验证成功/失败场景
- [x] 账户锁定/禁用处理
- [x] JWT令牌生成和验证
- [x] 密码修改功能
- [x] 密码重置功能
- [x] 用户资料获取
- [x] 安全统计和账户解锁

#### AuthController 测试
- [x] 用户登录接口 (POST /auth/login)
- [x] 获取用户资料接口 (GET /auth/profile)
- [x] 修改密码接口 (POST /auth/password)
- [x] 重置密码接口 (POST /auth/reset-password)
- [x] 各种错误场景处理

### ✅ 用户管理模块测试

#### UserService 测试
- [x] 用户查找 (findOne, findById)
- [x] 用户创建 (create)
- [x] 用户更新 (update)
- [x] 用户删除 (remove)
- [x] 用户列表查询 (findAll)
- [x] 密码更新 (updatePassword)
- [x] 最后登录时间更新 (updateLastLogin)
- [x] 权限检查 (hasPermission)
- [x] 角色检查 (hasRole)
- [x] 用户菜单获取 (getUserMenus)
- [x] 用户资料更新 (updateProfile)
- [x] 随机密码生成 (generateRandomPassword)

#### UserController 测试
- [x] 获取用户列表接口 (GET /users/list)
- [x] 创建用户接口 (POST /users/create)
- [x] 更新用户接口 (POST /users/update)
- [x] 删除用户接口 (POST /users/delete)
- [x] 权限控制测试（不能删除自己、不能修改自己的角色等）

## 🎯 测试覆盖的功能点

### 核心业务逻辑
- ✅ 用户认证与授权
- ✅ 用户管理 (CRUD)
- ✅ 角色和权限验证
- ✅ 密码安全处理
- ✅ 输入验证和数据转换

### 错误处理
- ✅ 业务错误码处理 (按照文档中的错误码规范)
- ✅ HTTP状态码统一为200
- ✅ 异常情况的正确响应
- ✅ 数据验证失败处理

### 安全性
- ✅ JWT令牌验证
- ✅ 账户锁定机制
- ✅ 权限不足处理
- ✅ 防止用户删除/修改自己

### 数据库操作
- ✅ MongoDB连接和操作
- ✅ 数据模型验证
- ✅ 查询优化和分页
- ✅ 事务处理

## 📊 测试配置

### Jest 配置特性
- ✅ TypeScript 支持
- ✅ 测试覆盖率报告
- ✅ 全局设置和清理
- ✅ 模块路径映射
- ✅ 测试超时配置
- ✅ 覆盖率阈值设置

### 测试环境隔离
- ✅ 独立的测试数据库
- ✅ 自动数据清理
- ✅ Mock 外部依赖
- ✅ 环境变量分离

## 🔍 运行示例

### 运行特定测试并查看详细输出
```bash
npm test -- --testNamePattern="应该成功验证用户" --verbose
```

### 生成HTML覆盖率报告
```bash
npm run test:cov && open coverage/index.html
```

### 调试测试
```bash
npm run test:debug -- --testNamePattern="认证模块"
```

## 📝 测试报告

运行测试后，您可以在以下位置找到报告：

- **控制台输出**: 测试结果概览
- **coverage/**: 覆盖率报告（HTML格式）
- **coverage/lcov-report/**: 详细覆盖率报告

## 🔧 故障排除

### 常见问题

1. **MongoDB连接失败**
   ```bash
   # 检查MongoDB服务状态
   brew services list | grep mongodb
   # 启动MongoDB服务
   brew services start mongodb-community@6.0
   ```

2. **测试超时**
   - 检查数据库连接
   - 增加Jest超时时间（已设置为30秒）

3. **端口冲突**
   - 修改 `.env.test` 中的端口配置

4. **依赖问题**
   ```bash
   # 清理依赖重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

## 🎯 测试最佳实践

本项目测试遵循以下最佳实践：

1. **测试命名**: 使用中文描述，明确测试意图
2. **AAA模式**: Arrange（安排）-> Act（执行）-> Assert（断言）
3. **测试隔离**: 每个测试独立运行，不依赖其他测试
4. **Mock策略**: 合理使用Mock，保证测试的可靠性
5. **错误测试**: 每个功能都包含正常和异常场景测试
6. **覆盖率要求**: 设置了最低覆盖率阈值（函数80%，行80%）

## 📚 参考文档

- [单元测试用例文档](./docs/单元测试用例文档.md) - 详细的测试规范和用例设计
- [Jest官方文档](https://jestjs.io/)
- [NestJS测试文档](https://docs.nestjs.com/fundamentals/testing)

---

**注意**: 请确保在运行测试前MongoDB服务正常运行，测试使用独立的数据库不会影响开发数据。