# 角色模块 (Role) 接口文档

本文档详细说明了角色管理模块的 API 接口。

**基础路径**: `/roles`

**通用说明**:
- 所有接口都需要有效的 `JWT Token` 进行认证，请在请求头中加入 `Authorization: Bearer <Your_Token>`。
- 接口会根据用户角色和权限进行访问控制。

---

## 1. 创建新角色

- **接口说明**: 用于创建一个新的角色。可以同时关联一组权限。
- **接口地址**: `POST /roles/create`
- **所需权限**: `role:create`

### 请求参数 (Request Body)

| 参数名        | 类型     | 是否必填 | 说明                                   |
| ------------- | -------- | -------- | -------------------------------------- |
| `name`        | string   | 是       | 角色的唯一名称                         |
| `description` | string   | 是       | 角色的详细描述                         |
| `permissions` | string[] | 否       | 与该角色关联的权限ID列表               |
| `status`      | string   | 否       | 角色状态 (`active` 或 `inactive`)，默认为 `active` |
| `isSystem`    | boolean  | 否       | 是否为系统角色，默认为 `false`         |

**请求示例**:
```json
{
  "name": "ProductManager",
  "description": "产品管理员，负责管理商品",
  "permissions": ["60d0fe4f5311236168a109ca", "60d0fe4f5311236168a109cb"]
}
```

### 响应 (Response)

**成功响应 (201 Created)**:
返回新创建的角色对象。

**响应示例**:
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "name": "ProductManager",
    "description": "产品管理员，负责管理商品",
    "permissions": [
        {
            "id": "60d0fe4f5311236168a109ca",
            "name": "product:create",
            "description": "创建商品"
        },
        {
            "id": "60d0fe4f5311236168a109cb",
            "name": "product:edit",
            "description": "编辑商品"
        }
    ],
    "status": "active",
    "isSystem": false,
    "createdAt": "2023-08-29T15:00:00.000Z",
    "updatedAt": "2023-08-29T15:00:00.000Z"
}
```

**失败响应**:
- `409 Conflict`: 如果角色名称 `name` 已存在。
- `400 Bad Request`: 如果 `permissions` 数组中包含不存在的权限ID。

---

## 2. 获取所有角色列表

- **接口说明**: 获取系统中所有角色的列表，并会填充每个角色关联的权限信息。
- **接口地址**: `GET /roles/list`
- **所需权限**: `role:read`

### 请求参数

无

### 响应 (Response)

**成功响应 (200 OK)**:
返回一个包含所有角色对象的数组。

**响应示例**:
```json
[
  {
    "id": "60d21b4667d0d8992e610c85",
    "name": "ProductManager",
    "description": "产品管理员，负责管理商品",
    "permissions": [
      {
        "id": "60d0fe4f5311236168a109ca",
        "name": "product:create",
        "description": "创建商品"
      }
    ],
    "status": "active",
    "isSystem": false
  },
  {
    "id": "60d21b4667d0d8992e610c86",
    "name": "OrderManager",
    "description": "订单管理员",
    "permissions": [],
    "status": "active",
    "isSystem": false
  }
]
```

---

## 3. 删除角色

- **接口说明**: 根据 ID 删除一个指定的角色。系统角色（`isSystem: true`）不可删除。
- **接口地址**: `POST /roles/delete`
- **所需权限**: `role:delete`

### 请求参数 (Request Body)

| 参数名 | 类型   | 是否必填 | 说明     |
| ------ | ------ | -------- | -------- |
| `id`   | string | 是       | 角色的 ID |

**请求示例**:
```json
{
  "id": "60d21b4667d0d8992e610c85"
}
```

### 响应 (Response)

**成功响应 (200 OK)**:
如果删除成功，不返回内容。

**失败响应**:
- `404 Not Found`: 如果提供的 `id` 找不到对应的角色。
- `400 Bad Request`: 如果尝试删除系统角色。

---

## 4. 为角色添加权限

- **接口说明**: 为指定角色批量添加一个或多个权限。
- **接口地址**: `POST /roles/add-permissions`
- **所需权限**: `role:update`

### 请求参数 (Request Body)

| 参数名          | 类型     | 是否必填 | 说明             |
| --------------- | -------- | -------- | ---------------- |
| `id`            | string   | 是       | 角色的 ID        |
| `permissionIds` | string[] | 是       | 要添加的权限ID列表 |

**请求示例**:
```json
{
  "id": "60d21b4667d0d8992e610c85",
  "permissionIds": ["60d0fe4f5311236168a109cc"]
}
```

### 响应 (Response)

**成功响应 (200 OK)**:
返回更新后的角色对象，包含最新的权限列表。

**响应示例**:
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "name": "ProductManager",
    "description": "产品管理员，负责管理商品",
    "permissions": [
        {
            "id": "60d0fe4f5311236168a109ca",
            "name": "product:create"
        },
        {
            "id": "60d0fe4f5311236168a109cc",
            "name": "product:delete"
        }
    ],
    "status": "active",
    "isSystem": false
}
```

**失败响应**:
- `404 Not Found`: 如果角色ID不存在。
- `400 Bad Request`: 如果 `permissionIds` 中有不存在的权限ID。

---

## 5. 从角色移除权限

- **接口说明**: 从指定角色批量移除一个或多个权限。
- **接口地址**: `POST /roles/remove-permissions`
- **所需权限**: `role:update`

### 请求参数 (Request Body)

| 参数名          | 类型     | 是否必填 | 说明             |
| --------------- | -------- | -------- | ---------------- |
| `id`            | string   | 是       | 角色的 ID        |
| `permissionIds` | string[] | 是       | 要移除的权限ID列表 |

**请求示例**:
```json
{
  "id": "60d21b4667d0d8992e610c85",
  "permissionIds": ["60d0fe4f5311236168a109cc"]
}
```

### 响应 (Response)

**成功响应 (200 OK)**:
返回更新后的角色对象，包含最新的权限列表。

**响应示例**:
```json
{
    "id": "60d21b4667d0d8992e610c85",
    "name": "ProductManager",
    "description": "产品管理员，负责管理商品",
    "permissions": [
        {
            "id": "60d0fe4f5311236168a109ca",
            "name": "product:create"
        }
    ],
    "status": "active",
    "isSystem": false
}
```

**失败响应**:
- `404 Not Found`: 如果角色ID不存在。