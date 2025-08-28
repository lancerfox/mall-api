# 用户模块 API 文档

## 接口重构说明

本次重构统一了用户模块的接口规范，所有接口仅使用 GET 和 POST 方法：
- **GET 方法**：用于查询类操作，参数通过 query 传递
- **POST 方法**：用于操作类功能，参数通过 body 传递

## 用户管理接口 (UserController)

### 查询类接口 (GET)

#### 1. 获取用户列表
- **路径**: `GET /users/list`
- **描述**: 获取用户列表，支持分页和筛选
- **参数**: Query 参数
  ```typescript
  {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }
  ```
- **响应**: `UserListResponseDto`

#### 2. 获取用户详情
- **路径**: `GET /users/detail`
- **描述**: 根据用户ID获取详细信息
- **参数**: Query 参数
  ```typescript
  {
    id: string; // 用户ID
  }
  ```
- **响应**: `UserResponseDto`


#### 4. 获取用户菜单
- **路径**: `GET /users/menus`
- **描述**: 获取用户可访问的菜单列表
- **参数**: Query 参数
  ```typescript
  {
    id: string; // 用户ID
  }
  ```
- **响应**: 
  ```typescript
  {
    permissions: string[];
    menus: any[];
  }
  ```

### 操作类接口 (POST)

#### 1. 创建用户
- **路径**: `POST /users/create`
- **描述**: 创建新用户
- **参数**: Body 参数 (`CreateUserDto`)
  ```typescript
  {
    username: string;
    email: string;
    password: string;
    role?: string;
    status?: string;
  }
  ```
- **响应**: `UserResponseDto`

#### 2. 更新用户信息
- **路径**: `POST /users/update`
- **描述**: 更新用户基本信息
- **参数**: Body 参数 (`UpdateUserWithIdDto`)
  ```typescript
  {
    id: string;
    username?: string;
    email?: string;
    role?: string;
    status?: string;
  }
  ```
- **响应**: `UserResponseDto`

#### 3. 删除用户
- **路径**: `POST /users/delete`
- **描述**: 删除指定用户
- **参数**: Body 参数 (`UserIdBodyDto`)
  ```typescript
  {
    id: string; // 用户ID
  }
  ```
- **响应**: 
  ```typescript
  {
    message: string;
  }
  ```


## 权限管理接口 (PermissionsController)

### 1. 获取所有权限列表
- **路径**: `GET /permissions`
- **描述**: 获取系统中所有可用权限
- **参数**: 无
- **响应**: 
  ```typescript
  {
    permissions: string[];
    predefinedPermissions: Record<string, string>;
  }
  ```

### 2. 获取所有角色列表
- **路径**: `GET /permissions/roles`
- **描述**: 获取系统中所有角色定义
- **参数**: 无
- **响应**: 
  ```typescript
  {
    roles: Record<string, string>;
    roleDescriptions: Record<string, string>;
  }
  ```

## 重构前后对比

| 功能 | 重构前 | 重构后 |
|------|--------|--------|
| 获取用户列表 | `GET /users` | `GET /users/list` |
| 获取用户详情 | `GET /users/detail` + `GET /users/:id/detail` | `GET /users/detail` |
| 创建用户 | `POST /users` | `POST /users/create` |
| 更新用户 | `PUT /users` | `POST /users/update` |
| 删除用户 | `DELETE /users` | `POST /users/delete` |
| 获取用户菜单 | `GET /users/:id/menus` | `GET /users/menus` |

## 使用示例

### 前端调用示例

```typescript
// 获取用户列表
const getUserList = async (params: QueryUserDto) => {
  const response = await fetch(`/api/users/list?${new URLSearchParams(params)}`);
  return response.json();
};

// 获取用户详情
const getUserDetail = async (id: string) => {
  const response = await fetch(`/api/users/detail?id=${id}`);
  return response.json();
};

// 创建用户
const createUser = async (userData: CreateUserDto) => {
  const response = await fetch('/api/users/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// 更新用户
const updateUser = async (userData: UpdateUserWithIdDto) => {
  const response = await fetch('/api/users/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// 删除用户
const deleteUser = async (id: string) => {
  const response = await fetch('/api/users/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  return response.json();
};
```

## 注意事项

1. **权限控制**: 所有接口都需要相应的权限验证
2. **参数验证**: 使用 DTO 进行严格的参数验证
3. **错误处理**: 统一的错误响应格式
4. **安全性**: 防止用户修改自己的角色和删除自己的账户