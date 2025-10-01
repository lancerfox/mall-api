# Mall API

电商平台后端API服务，基于NestJS框架构建。

## 项目概述

这是一个电商平台的后端API服务，提供了完整的电商功能，包括商品管理、订单处理、用户管理、权限控制等核心功能。

## 技术栈

- **后端框架**: [NestJS](https://nestjs.com/)
- **编程语言**: [TypeScript](https://www.typescriptlang.org/)
- **数据库**: PostgreSQL (通过TypeORM)
- **API文档**: [Swagger](https://swagger.io/)
- **身份验证**: JWT
- **文件存储**: Supabase Storage

## 开发规范

项目遵循严格的编码规范，详细规范请参考:
- [项目编码规范文档](./docs/规范/项目编码规范文档.md)
- [API 编程助手核心规则](./docs/规范/AI 编程助手核心规则.md)
- [测试规范文档](./docs/规范/测试规范文档.md)

## 快速开始

### 环境要求

- Node.js >= 18.x
- PostgreSQL >= 13.x
- npm >= 8.x

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env.example` 文件并重命名为 `.env`，然后根据需要配置环境变量：

```bash
cp .env.example .env
```

### 数据库初始化

```bash
# 初始化开发环境RBAC数据
npm run init:dev-rbac

# 初始化测试环境RBAC数据
npm run init:test-rbac
```

### 启动开发服务器

```bash
# 开发模式启动
npm run start:dev

# 生产模式启动
npm run start:prod
```

### 运行测试

```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:cov

# 监听模式运行测试
npm run test:watch
```

## API文档

项目集成了Swagger API文档，启动服务后可通过以下地址访问：

```
http://localhost:3000/api
```

## 项目结构

```
src
├── common/         # 全局公共模块
├── config/         # 项目配置
├── scripts/        # 构建和部署脚本
└── modules/        # 业务模块
```

## 编码规范要点

1. **目录结构**: 遵循模块化设计，每个业务功能独立成模块
2. **命名规范**: 统一使用kebab-case、PascalCase、camelCase等命名约定
3. **代码风格**: 使用Prettier和ESLint保持代码风格一致
4. **类型安全**: 充分利用TypeScript的类型系统，避免使用any类型
5. **API设计**: 统一使用GET和POST方法，响应结构遵循IApiResponse接口
6. **异常处理**: 使用自定义BusinessException处理业务异常
7. **安全规范**: 避免硬编码敏感信息，使用环境变量管理配置

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 发起Pull Request

## 许可证

本项目为专有软件，保留所有权利。