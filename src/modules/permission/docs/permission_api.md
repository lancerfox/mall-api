# 权限模块（Permission）接口文档

本文档详细说明了权限管理模块的 API 接口。

**基础路径**: `/permissions`

**通用说明**:
- 所有接口都需要有效的 `JWT Token` 进行认证，请在请求头中加入 `Authorization: Bearer <Your_Token>`。
- 接口会根据用户角色和权限进行访问控制。

**权限类型说明**:
- `API`: 后端接口权限，控制API访问
- `PAGE`: 前端页面权限，控制页面访问  
- `OPERATION`: 操作权限，控制页面内操作按钮
- `DATA`: 数据权限，控制数据访问范围

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
| `module`    | string | 否       | 权限所属的模块（可自定义） |
| `status`    | string | 否       | 权限状态 (`active` 或 `inactive`)，默认为 `active` |
| `type`      | string | 否       | 权限类型 (`API`, `PAGE`, `OPERATION`, `DATA`)，默认为 `API` |

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

## 2. 获取权限列表

- **接口说明**: 获取权限列表，支持按类型筛选。
- **接口地址**: `GET /permissions/list`
- **所需权限**: `permission:read`

### 请求参数

| 参数名 | 类型   | 是否必填 | 说明                                       | 可选值                                  |
| ------ | ------ | -------- | ------------------------------------------ | --------------------------------------- |
| `type` | string | 否       | 权限类型筛选参数，不传则返回所有类型权限 | `API`, `PAGE`, `OPERATION`, `DATA` |

### 响应 (Response)

**成功响应 (200 OK)**:
返回一个包含权限对象的数组。如果指定了类型参数，则只返回该类型的权限；否则返回所有权限。

**响应示例**:
```json
[
  {
    "name": "user:create",
    "description": "允许创建新用户",
    "module": "UserManagement",
    "type": "API",
    "status": "active",
    "_id": "60d0fe4f5311236168a109ca",
    "createdAt": "2023-08-29T14:30:00.000Z",
    "updatedAt": "2023-08-29T14:30:00.000Z"
  },
  {
    "name": "user:delete",
    "description": "允许删除用户",
    "module": "UserManagement",
    "type": "API",
    "status": "active",
    "_id": "60d0fe4f5311236168a109cb",
    "createdAt": "2023-08-29T14:31:00.000Z",
    "updatedAt": "2023-08-29T14:31:00.000Z"
  },
  {
    "name": "user:list:view",
    "description": "查看用户列表页面",
    "module": "UserManagement",
    "type": "PAGE",
    "status": "active",
    "_id": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-08-29T14:32:00.000Z",
    "updatedAt": "2023-08-29T14:32:00.000Z"
  },
  {
    "name": "user:export",
    "description": "导出用户数据",
    "module": "UserManagement",
    "type": "OPERATION",
    "status": "active",
    "_id": "60d0fe4f5311236168a109cd",
    "createdAt": "2023-08-29T14:33:00.000Z",
    "updatedAt": "2023-08-29T14:33:00.000Z"
  }
]
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

## 4. 更新权限信息

- **接口说明**: 根据 ID 更新权限信息。
- **接口地址**: `POST /permissions/update`
- **所需权限**: `permission:update`

### 请求参数 (Request Body)

| 参数名      | 类型   | 是否必填 | 说明           |
| ----------- | ------ | -------- | -------------- |
| `id`        | string | 是       | 权限的 ID      |
| `name`      | string | 否       | 权限的唯一名称 |
| `description` | string | 否       | 权限的详细描述 |
| `module`    | string | 否       | 权限所属的模块 |
| `status`    | string | 否       | 权限状态 (`active` 或 `inactive`) |
| `type`      | string | 否       | 权限类型 (`API`, `PAGE`, `OPERATION`, `DATA`) |

**请求示例**:
```json
{
  "id": "60d0fe4f5311236168a109ca",
  "name": "user:create:updated",
  "description": "更新后的权限描述",
  "module": "UserManagement",
  "status": "active",
  "type": "API"
}
```

### 响应 (Response)

**成功响应 (200 OK)**:
返回更新后的权限对象。

**响应示例**:
```json
{
  "name": "user:create:updated",
  "description": "更新后的权限描述",
  "module": "UserManagement",
  "type": "API",
  "status": "active",
  "_id": "60d0fe4f5311236168a109ca",
  "createdAt": "2023-08-29T14:30:00.000Z",
  "updatedAt": "2023-08-29T15:30:00.000Z"
}
```

**失败响应**:
- `404 Not Found`: 如果提供的 `id` 找不到对应的权限
- `409 Conflict`: 如果权限名称 `name` 已存在（除了当前权限）

---


