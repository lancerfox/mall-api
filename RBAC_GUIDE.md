# RBAC 权限管理系统使用指南

## 概述

本项目已成功从简单的角色权限模型升级为完整的 RBAC（基于角色的访问控制）系统。

## 系统架构

### 核心实体关系

```
用户 (User) ←→ 角色 (Role) ←→ 权限 (Permission)
```

- **用户 (User)**: 系统使用者，可以拥有多个角色
- **角色 (Role)**: 权限的集合，可以动态创建和管理
- **权限 (Permission)**: 具体的操作许可，如 "user:read", "product:edit"

### 数据模型变更

#### 旧模型 (已废弃)
```typescript
class User {
  role: 'admin' | 'super_admin' | 'operator';  // 固定枚举
  permissions: string[];                        // 直接权限数组
}
```

#### 新模型 (RBAC)
```typescript
class User {
  roles: ObjectId[];  // 关联到 Role 实体
}

class Role {
  name: string;
  permissions: ObjectId[];  // 关联到 Permission 实体
  isSystem: boolean;        // 是否为系统角色
}

class Permission {
  name: string;        // 权限标识，如 "user:read"
  description: string; // 权限描述
  category: string;    // 权限分类
}
```

## 初始化系统

### 1. 初始化 RBAC 数据

```bash
# 创建默认角色和权限
npm run init-rbac
```

这将创建：
- 默认的超级管理员角色 (`super_admin`)
- 基础权限集合
- 系统必需的角色关系

### 2. 迁移现有数据

```bash
# 将旧的用户数据迁移到新的 RBAC 模型
npm run migrate-rbac
```

## API 使用

### 权限管理 API

```typescript
// 获取所有权限
GET /permissions

// 创建权限
POST /permissions
{
  "name": "product:create",
  "description": "创建商品",
  "category": "product"
}

// 更新权限
PUT /permissions/:id
{
  "description": "更新后的描述"
}

// 删除权限
DELETE /permissions/:id
```

### 角色管理 API

```typescript
// 获取所有角色
GET /roles

// 创建角色
POST /roles
{
  "name": "product_manager",
  "description": "商品管理员",
  "permissionNames": ["product:read", "product:create", "product:update"]
}

// 更新角色
PUT /roles/:id
{
  "description": "更新后的描述"
}

// 为角色添加权限
POST /roles/:id/permissions
{
  "permissionIds": ["permission_id_1", "permission_id_2"]
}

// 从角色移除权限
DELETE /roles/:id/permissions
{
  "permissionIds": ["permission_id_1"]
}

// 删除角色
DELETE /roles/:id
```

### 用户管理 API

```typescript
// 创建用户（带角色）
POST /users
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "roleIds": ["role_id_1", "role_id_2"]
}

// 更新用户角色
PUT /users/:id
{
  "roleIds": ["new_role_id_1", "new_role_id_2"]
}

// 为用户添加角色
POST /users/:id/roles
{
  "roleIds": ["role_id_1"]
}

// 从用户移除角色
DELETE /users/:id/roles
{
  "roleIds": ["role_id_1"]
}
```

## 权限验证

### 使用装饰器进行权限控制

```typescript
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  
  @Get()
  @RequirePermissions('product:read')
  findAll() {
    // 只有拥有 'product:read' 权限的用户才能访问
  }

  @Post()
  @RequirePermissions('product:create')
  create(@Body() createProductDto: CreateProductDto) {
    // 只有拥有 'product:create' 权限的用户才能访问
  }

  @Put(':id')
  @RequirePermissions('product:update')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    // 只有拥有 'product:update' 权限的用户才能访问
  }

  @Delete(':id')
  @RequirePermissions('product:delete')
  remove(@Param('id') id: string) {
    // 只有拥有 'product:delete' 权限的用户才能访问
  }
}
```

### 权限命名规范

建议使用以下格式：`资源:操作`

```typescript
// 用户管理
'user:read'    // 查看用户
'user:create'  // 创建用户
'user:update'  // 更新用户
'user:delete'  // 删除用户

// 商品管理
'product:read'    // 查看商品
'product:create'  // 创建商品
'product:update'  // 更新商品
'product:delete'  // 删除商品

// 订单管理
'order:read'    // 查看订单
'order:create'  // 创建订单
'order:update'  // 更新订单
'order:delete'  // 删除订单
```

## 系统角色

### 预定义角色

1. **super_admin** (系统角色，不可删除)
   - 拥有所有权限
   - 可以管理其他管理员
   - 可以创建和管理角色

2. **admin** (系统角色，不可删除)
   - 基础管理权限
   - 不能管理其他管理员

3. **operator** (系统角色，不可删除)
   - 基础操作权限
   - 只能进行日常操作

### 自定义角色

您可以根据业务需要创建自定义角色：

```typescript
// 示例：商品管理员角色
{
  "name": "product_manager",
  "description": "负责商品管理的角色",
  "permissionNames": [
    "product:read",
    "product:create", 
    "product:update",
    "product:delete",
    "category:read",
    "category:create"
  ]
}
```

## 最佳实践

### 1. 权限设计原则

- **最小权限原则**: 用户只获得完成工作所需的最小权限
- **职责分离**: 不同的业务功能使用不同的权限
- **权限粒度**: 权限应该足够细粒度以支持灵活的访问控制

### 2. 角色设计原则

- **业务导向**: 角色应该反映实际的业务职责
- **可复用性**: 设计通用的角色以减少管理复杂性
- **层次化**: 可以设计角色层次结构

### 3. 安全考虑

- **定期审计**: 定期检查用户的角色和权限分配
- **权限回收**: 及时回收离职员工的权限
- **监控日志**: 记录权限相关的操作日志

## 测试

运行 RBAC 相关测试：

```bash
# 运行所有测试
npm test

# 只运行权限和角色相关测试
npm test -- --testPathPatterns="permission|role"

# 运行用户服务测试
npm test -- --testPathPatterns="user.service"
```

## 故障排除

### 常见问题

1. **权限验证失败**
   - 检查用户是否拥有正确的角色
   - 检查角色是否包含所需的权限
   - 检查权限名称是否正确

2. **角色创建失败**
   - 检查权限是否存在
   - 检查角色名称是否重复

3. **数据迁移问题**
   - 确保先运行 `npm run init-rbac`
   - 检查数据库连接是否正常

### 调试技巧

```typescript
// 在控制器中获取当前用户的权限
@Get('my-permissions')
async getMyPermissions(@CurrentUser() user: User) {
  const userWithRoles = await this.userService.findByIdWithRoles(user.id);
  const permissions = await this.userService.getUserPermissions(user.id);
  return { user: userWithRoles, permissions };
}
```

## 更新日志

- **v2.0.0**: 完整的 RBAC 系统实现
  - 新增 Permission 和 Role 实体
  - 重构 User 实体以支持多角色
  - 新增权限验证装饰器和守卫
  - 提供数据迁移脚本
  - 完整的单元测试覆盖