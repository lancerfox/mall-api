# 项目结构与架构

## 目录组织

### 根目录结构
```
├── src/                    # 源代码
├── test/                   # E2E 测试和测试配置
├── docs/                   # 项目文档
├── scripts/                # 工具脚本（RBAC 初始化）
├── uploads/                # 文件上传存储
└── dist/                   # 编译输出
```

### 源码结构 (`src/`)
```
src/
├── common/                 # 共享工具和组件
│   ├── constants/          # 应用常量和错误码
│   ├── decorators/         # 自定义装饰器（@Roles, @Permissions, @User, @Public）
│   ├── dto/               # 通用 DTO（分页、成功响应）
│   ├── enums/             # 共享枚举（RoleType）
│   ├── filters/           # 异常过滤器（HttpExceptionFilter）
│   ├── guards/            # 路由守卫（JwtAuthGuard, RolesGuard）
│   ├── interceptors/      # 响应拦截器（TransformInterceptor）
│   ├── pipes/             # 验证管道（MongoIdValidationPipe）
│   └── types/             # 全局类型定义（ApiResponse 接口）
├── config/                # 配置模块
│   ├── config.module.ts   # 全局配置模块
│   └── validation.schema.ts # 环境变量验证
├── modules/               # 业务模块
│   ├── auth/              # 身份认证与授权
│   ├── user/              # 用户管理
│   ├── role/              # 角色管理
│   ├── permission/        # 权限管理
│   ├── menu/              # 菜单管理
│   └── product/           # 商品目录（SPU/SKU）
└── main.ts               # 应用启动入口
```

## 模块结构模式

每个业务模块遵循一致的结构：
```
modules/<模块名>/
├── controllers/           # HTTP 请求处理器
├── services/             # 业务逻辑
├── dto/                  # 数据传输对象
├── entities/             # 数据库实体（Mongoose 模式）
├── tests/                # 单元测试（.spec.ts 文件）
├── docs/                 # API 文档（.md 文件）
├── types/                # 模块特定类型
└── <模块名>.module.ts     # 模块定义
```

## 命名规范

### 文件与目录
- **目录**：`kebab-case`（如 `product-category`）
- **文件**：`kebab-case` 加用途后缀（如 `user.controller.ts`, `auth.service.ts`）
- **测试文件**：单元测试用 `<name>.spec.ts`，e2e 测试用 `<name>.e2e-spec.ts`

### 代码元素
- **类**：`PascalCase`（如 `UserController`, `AuthService`）
- **接口**：`PascalCase` 加 `I` 前缀（如 `IApiResponse`, `IUser`）
- **方法/变量**：`camelCase`（如 `getUserById`, `isActive`）
- **常量**：`UPPER_SNAKE_CASE`（如 `ERROR_CODES`, `DEFAULT_PAGE_SIZE`）
- **枚举**：枚举和成员都用 `PascalCase`（如 `RoleType.Admin`）

## 架构模式

### 分层架构
1. **控制器层**：HTTP 请求/响应处理，验证
2. **服务层**：业务逻辑，数据处理
3. **实体层**：数据库模型和模式
4. **DTO 层**：数据传输和验证对象

### 全局组件
- **守卫**：全局应用身份认证（JWT）和授权（角色）
- **拦截器**：将所有响应转换为标准化格式
- **过滤器**：处理异常并转换为 API 响应格式
- **管道**：验证请求数据并转换参数

### API 设计原则
- **HTTP 方法**：仅使用 GET（查询）和 POST（变更）
- **响应格式**：标准化 `{ code, message, data }` 结构
- **错误处理**：业务码（1000-5999 范围）配合描述性消息
- **文档**：所有端点都需要 Swagger 注解

### 数据库模式
- **实体**：Mongoose 模式配合适当验证
- **关系**：根据需要使用嵌入文档和引用
- **索引**：为查询性能设置策略性索引
- **验证**：模式级和应用级验证

### 测试结构
```
test/
├── setup/                # 测试配置和固定数据
│   ├── fixtures/         # 测试数据（用户、角色）
│   ├── database.setup.ts # 数据库测试设置
│   ├── jest.setup.ts     # Jest 配置
│   └── rbac-setup.ts     # 测试用 RBAC 初始化
└── jest-e2e.json        # E2E 测试配置
```

## 模块依赖关系
- **通用模块**被业务模块导入
- **配置模块**是全局的，在任何地方都可用
- **业务模块**相互独立，通过定义良好的接口通信
- **数据库连接**在应用模块级别配置