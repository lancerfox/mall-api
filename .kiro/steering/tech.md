# 技术栈

## 核心框架与语言

- **后端框架**：NestJS 11.x
- **编程语言**：TypeScript 5.7+，启用严格模式
- **运行时**：Node.js，目标版本 ES2023
- **包管理器**：pnpm（工作区配置）

## 数据库与 ODM

- **数据库**：MongoDB 6.x
- **ODM**：Mongoose 8.x 通过 @nestjs/mongoose
- **连接配置**：使用环境变量的异步配置

## 身份认证与安全

- **身份认证**：JWT 通过 @nestjs/jwt 和 passport-jwt
- **密码加密**：bcrypt
- **守卫**：自定义 JWT 和基于角色的守卫
- **验证**：class-validator 和 class-transformer

## API 与文档

- **API 文档**：Swagger/OpenAPI 通过 @nestjs/swagger
- **验证**：全局 ValidationPipe 带转换功能
- **响应格式**：标准化 API 响应结构
- **文件上传**：Multer 配合 Sharp 进行图像处理

## 开发工具

- **代码检查**：ESLint 9.x 支持 TypeScript
- **代码格式化**：Prettier 3.x
- **测试**：Jest 30.x 配合 supertest 进行 e2e 测试
- **测试数据库**：mongodb-memory-server 用于隔离测试

## 常用命令

### 开发环境

```bash
# 启动开发服务器（监听模式）
pnpm start:dev

# 启动调试模式
pnpm start:debug

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start:prod
```

### 代码质量

```bash
# 运行代码检查并自动修复
pnpm lint

# 检查代码但不修复
pnpm lint:check

# 格式化代码
pnpm format

# 类型检查
pnpm typecheck
```

### 测试

```bash
# 设置测试环境（初始化 RBAC）
pnpm test:setup

# 运行单元测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:cov

# 运行端到端测试
pnpm test:e2e

# 运行所有测试（设置 + 单元测试）
pnpm test:all
```

### 数据库初始化

```bash
# 初始化开发环境 RBAC 系统
pnpm init:dev-rbac

# 初始化测试环境 RBAC 系统
pnpm init:test-rbac
```

## 环境配置

- 使用 dotenv 进行环境管理
- Joi 模式验证环境变量
- 分离的 .env 和 .env.test 文件
- 全局前缀：`/api`
- Swagger 文档地址：`/api/docs`

## 代码质量标准

- **覆盖率阈值**：分支 70%，函数/行/语句 80%
- **TypeScript**：严格模式，全面类型检查
- **ESLint**：最大 0 警告策略
- **架构**：模块化结构，清晰的关注点分离
