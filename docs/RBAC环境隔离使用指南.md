# RBAC系统环境隔离使用指南

## 概述

修改后的 `init-rbac-system.js` 脚本现在支持环境隔离，可以在测试环境和生产环境中使用不同的数据库。

## 环境检测机制

脚本会根据以下条件自动检测运行环境：

### 测试环境检测
脚本会检测以下任一条件来判断是否为测试环境：
- `process.env.NODE_ENV === 'test'`
- 命令行参数包含 `--test`
- npm生命周期事件为 `test` 或 `test:cov`

### 数据库连接配置
- **测试环境**: 自动加载 `.env.test` 文件，使用测试数据库
- **生产环境**: 使用默认的 `.env` 文件，连接生产数据库

## 使用方法

### 1. 生产环境初始化
```bash
# 使用默认环境变量（生产数据库）
node scripts/init-rbac-system.js

# 或者使用npm脚本
npm run init-rbac
```

### 2. 测试环境初始化
```bash
# 方法1: 使用专用测试脚本
npm run init:test-rbac

# 方法2: 使用--test参数
node scripts/init-rbac-system.js --test

# 方法3: 设置环境变量
NODE_ENV=test node scripts/init-rbac-system.js
```

### 3. 运行单元测试
```bash
# 验证测试环境数据库连接
npm run test:verify-db

# 自动初始化并运行测试
npm run test:all

# 手动初始化测试环境
npm run test:setup

# 正常运行测试（Jest会自动检查并初始化RBAC）
npm test
```

## 特性说明

### 环境隔离
- 测试环境和生产环境使用完全独立的数据库
- 测试时不会影响生产数据
- 每个环境的RBAC数据独立管理

### 智能初始化
- Jest测试会自动检查RBAC系统是否已初始化
- 如果未初始化，会自动执行初始化
- 避免重复初始化，提高测试效率

### 数据保护
- 测试环境清理时会保留RBAC数据（角色和权限）
- 只清空业务数据（用户、材料等）
- 确保测试环境的连续性

### 数据一致性
- 测试环境会完全清空并重建权限数据
- 确保每次测试的权限数据一致
- 生产环境保留现有权限，只添加新的

## 配置文件

### .env.test (测试环境)
```bash
DATABASE_URL=mongodb://localhost:27017/mall-api-test
DATABASE_NAME=mall-api-test
NODE_ENV=test
JWT_SECRET=test-jwt-secret-key-for-unit-testing-only
```

### .env (生产环境)
```bash
DATABASE_URL=mongodb://your-production-db-url
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret
```

## 常见问题

### Q: 测试失败，提示缺少角色或权限
A: 运行 `npm run init:test-rbac` 手动初始化测试环境的RBAC系统

### Q: 如何重置测试环境的RBAC数据
A: 测试环境的RBAC数据会在每次初始化时完全重建，无需手动重置

### Q: 生产环境是否会清空现有数据
A: 不会。生产环境只会添加缺失的权限和角色，保留现有数据

### Q: 如何验证环境隔离是否生效
A: 运行 `npm run test:verify-db` 验证测试环境数据库连接，或检查脚本输出的日志，会显示当前环境和数据库连接信息

### Q: 测试仍然连接到线上数据库怎么办
A: 检查 `.env.test` 文件是否存在且配置正确，确保 `DATABASE_URL=mongodb://localhost:27017/mall-api-test`

## 日志示例

### 测试环境日志
```
🧪 检测到测试环境，使用测试数据库配置
🚀 开始初始化 RBAC 权限系统... (环境: test)
📡 连接数据库: mongodb://localhost:27017/mall-api-test
```

### 生产环境日志
```
🚀 检测到生产环境，使用生产数据库配置
🚀 开始初始化 RBAC 权限系统... (环境: production)
📡 连接数据库: mongodb://your-production-url
```

## 注意事项

1. 确保测试前MongoDB服务正在运行
2. 确保 `.env.test` 文件存在且配置正确
3. 测试环境数据库应该与生产环境完全隔离
4. 首次运行测试前建议手动初始化一次RBAC系统