# 珠子材料库管理系统开发文档

## 项目概述

珠子材料库管理系统是一个基于 Vue 3 + NestJS + MongoDB 的后台管理系统，用于管理珠子材料的分类、库存、出入库等业务功能。

## 技术架构

### 前端技术栈
- **框架**: Vue 3.4.15 + TypeScript 5.3.3
- **UI组件库**: Element Plus 2.5.5
- **构建工具**: Vite 5.0.12
- **状态管理**: Pinia 2.1.7
- **路由**: Vue Router 4.2.5
- **HTTP客户端**: Axios 1.6.7
- **图表库**: ECharts 5.4.3
- **样式**: UnoCSS + Less

### 后端技术栈
- **框架**: NestJS 11.0.1
- **数据库**: MongoDB + Mongoose 8.17.1
- **身份验证**: JWT + Passport
- **API文档**: Swagger
- **验证**: class-validator + class-transformer
- **配置管理**: @nestjs/config

## 开发阶段规划

### 第一阶段：基础功能实现
- 数据库设计和模型创建
- 分类管理功能
- 材料管理功能
- 基础搜索和分页

### 第二阶段：库存管理功能
- 库存出入库操作
- 库存变更记录
- 库存预警机制

### 第三阶段：高级搜索和筛选
- 多条件搜索
- 搜索条件保存
- 高级筛选功能

### 第四阶段：数据统计和可视化
- 数据仪表盘
- 统计报表
- 图表展示

## 文档结构

```
docs/珠子材料库管理系统/
├── README.md                    # 项目概述文档
├── 第一阶段-基础功能/
│   ├── 后端开发任务.md           # 后端详细任务
│   ├── 前端开发任务.md           # 前端详细任务
│   └── 数据库设计.md             # 数据库结构设计
├── 第二阶段-库存管理/
│   ├── 后端开发任务.md
│   └── 前端开发任务.md
├── 第三阶段-搜索筛选/
│   ├── 后端开发任务.md
│   └── 前端开发任务.md
└── 第四阶段-数据统计/
    ├── 后端开发任务.md
    └── 前端开发任务.md
```

## 开发规范

### 代码规范
- 遵循 ESLint + Prettier 代码格式化规范
- 使用 TypeScript 严格模式
- 组件和文件命名采用 PascalCase
- API 接口采用 RESTful 设计

### Git 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 开发环境要求

- Node.js >= 18.0.0
- pnpm >= 8.1.0
- MongoDB >= 6.0
- Git

## 快速开始

### 后端启动
```bash
cd mall-api
pnpm install
pnpm start:dev
```

### 前端启动
```bash
cd admin-mall
pnpm install
pnpm dev
```

## 联系方式

如有问题请联系开发团队或查看相关技术文档。