# 权限模块（Permission）接口文档

本文档详细说明了权限管理模块的 API 接口。

**基础路径**: `/permissions`

**通用说明**:
- 所有接口都需要有效的 `JWT Token` 进行认证，请在请求头中加入 `Authorization: Bearer <Your_Token>`。
- 接口会根据用户角色和权限进行访问控制。

---

## 1. 创建新权限

- **接口说明**: 用于创建一个新的权限。
- **接口地址**: `POST /permissions/create`
- **所需权限**: `permission:create`

### 请求参数 (Request Body)

| 参数名      | 类型   | 是否必填 | 说明           |
| ----------- | ------ | -------- | -------------- |
| `name`      | string | 是       | 权限的唯一名称 |
| `description` | string | 是       | 权限的详细描述 |
| `module`    | string | 否       | 权限所属的模块 |
| `status`    | string | 否       | 权限状态 (`active` 或 `inactive`)，默认为 `active` |

**请求示例**:
```json
{
  "name": "user:create",
  "description": "允许创建新用户",
  "module": "UserManagement"
}
```

### 响应 (Response)

**成功响应 (201 Created)**:
返回新创建的权限对象。

**响应示例**:
```json
{
  "name": "user:create",
  "description": "允许创建新用户",
  "module": "UserManagement",
  "status": "active",
  "_id": "60d0fe4f5311236168a109ca",
  "createdAt": "2023-08-29T14:30:00.000Z",
  "updatedAt": "2023-08-29T14:30:00.000Z"
}
```

**失败响应**:
- `409 Conflict`: 如果权限名称 `name` 已存在。

---

## 2. 获取所有权限列表

- **接口说明**: 获取系统中存在的所有权限的列表。
- **接口地址**: `GET /permissions/list`
- **所需权限**: `permission:read`

### 请求参数

无

### 响应 (Response)

**成功响应 (200 OK)**:
返回一个包含所有权限对象的数组。

**响应示例**:
```json
[
  {
    "name": "user:create",
    "description": "允许创建新用户",
    "module": "UserManagement",
    "status": "active",
    "_id": "60d0fe4f5311236168a109ca",
    "createdAt": "2023-08-29T14:30:00.000Z",
    "updatedAt": "2023-08-29T14:30:00.000Z"
  },
  {
    "name": "user:delete",
    "description": "允许删除用户",
    "module": "UserManagement",
    "status": "active",
    "_id": "60d0fe4f5311236168a109cb",
    "createdAt": "2023-08-29T14:31:00.000Z",
    "updatedAt": "2023-08-29T14:31:00.000Z"
  }
]
```

---

## 3. 删除权限

- **接口说明**: 根据 ID 删除一个指定的权限。
- **接口地址**: `POST /permissions/delete`
- **所需权限**: `permission:delete`

### 请求参数 (Request Body)

| 参数名 | 类型   | 是否必填 | 说明     |
| ------ | ------ | -------- | -------- |
| `id`   | string | 是       | 权限的 ID |

**请求示例**:
```json
{
  "id": "60d0fe4f5311236168a109ca"
}
```

### 响应 (Response)

**成功响应 (200 OK)**:
如果删除成功，通常不返回内容，或返回一个成功提示。

**失败响应**:
- `404 Not Found`: 如果提供的 `id` 找不到对应的权限。

---

## 4. 获取所有预定义权限列表

- **接口说明**: 获取代码中预定义的所有权限常量。这对于前端构建权限选择界面非常有用。
- **接口地址**: `GET /permissions/predefined`
- **所需角色**: `SUPER_ADMIN` 或 `ADMIN`

### 请求参数

无

### 响应 (Response)

**成功响应 (200 OK)**:
返回一个对象，包含两个字段：
- `permissions`: 一个去重并排序后的权限字符串列表。
- `predefinedPermissions`: 一个 key-value 形式的权限常量映射表。

**响应示例**:
```json
{
  "permissions": [
    "permission:create",
    "permission:delete",
    "permission:read",
    "role:create",
    "role:delete",
    "role:read",
    "user:create",
    "user:delete",
    "user:read",
    "user:update"
  ],
  "predefinedPermissions": {
    "PERMISSION_CREATE": "permission:create",
    "PERMISSION_DELETE": "permission:delete",
    "PERMISSION_READ": "permission:read",
    "ROLE_CREATE": "role:create",
    "ROLE_DELETE": "role:delete",
    "ROLE_READ": "role:read",
    "USER_CREATE": "user:create",
    "USER_DELETE": "user:delete",
    "USER_READ": "user:read",
    "USER_UPDATE": "user:update"
  }
}