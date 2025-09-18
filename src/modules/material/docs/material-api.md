# 素材模块接口文档

## 概述

素材模块提供素材的创建、查询、更新、删除以及批量操作等功能。所有接口都遵循RESTful设计原则。

## 基础信息

- **基础路径**: `/api/material`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`

## 接口列表

### 1. 创建素材

**接口说明**: 创建新的素材记录

**请求方式**: `POST`

**接口路径**: `/api/v1/material/create`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| name | string | 是 | 素材名称 | "图片素材1" |
| url | string | 是 | 素材URL | "https://example.com/image1.jpg" |
| type | string | 是 | 素材类型 (e.g., image, video) | "image" |
| categoryId | string | 否 | 素材分类ID | "category-id-1" |

**请求示例**:
```json
{
  "name": "图片素材1",
  "url": "https://example.com/image1.jpg",
  "type": "image",
  "categoryId": "category-id-1"
}
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | string | 素材ID | "material-id-1" |
| name | string | 素材名称 | "图片素材1" |
| url | string | 素材URL | "https://example.com/image1.jpg" |
| type | string | 素材类型 | "image" |
| categoryId | string | 素材分类ID | "category-id-1" |
| createdAt | string | 创建时间 | "2024-01-01T00:00:00.000Z" |

**响应示例**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": "material-id-1",
    "name": "图片素材1",
    "url": "https://example.com/image1.jpg",
    "type": "image",
    "categoryId": "category-id-1",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**错误码**:
- `400`: 请求参数错误
- `401`: 未授权访问

---

### 2. 获取素材列表

**接口说明**: 获取素材列表，支持分页和筛选

**请求方式**: `GET`

**接口路径**: `/api/v1/material/list`

**认证要求**: 需要JWT Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| page | number | 否 | 页码，默认为1 | 1 |
| limit | number | 否 | 每页数量，默认为10 | 10 |
| name | string | 否 | 素材名称关键词 | "图片" |
| type | string | 否 | 素材类型 | "image" |
| categoryId | string | 否 | 素材分类ID | "category-id-1" |

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| items | array | 素材列表 | [...] |
| total | number | 总数 | 100 |
| page | number | 当前页码 | 1 |
| limit | number | 每页数量 | 10 |
| totalPages | number | 总页数 | 10 |

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "items": [
      {
        "id": "material-id-1",
        "name": "图片素材1",
        "url": "https://example.com/image1.jpg",
        "type": "image",
        "categoryId": "category-id-1",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**错误码**:
- `401`: 未授权访问

---

### 3. 获取素材详情

**接口说明**: 根据素材ID获取素材详情

**请求方式**: `GET`

**接口路径**: `/api/v1/material/:id`

**认证要求**: 需要JWT Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 素材ID | "material-id-1" |

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | string | 素材ID | "material-id-1" |
| name | string | 素材名称 | "图片素材1" |
| url | string | 素材URL | "https://example.com/image1.jpg" |
| type | string | 素材类型 | "image" |
| categoryId | string | 素材分类ID | "category-id-1" |
| createdAt | string | 创建时间 | "2024-01-01T00:00:00.000Z" |

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": "material-id-1",
    "name": "图片素材1",
    "url": "https://example.com/image1.jpg",
    "type": "image",
    "categoryId": "category-id-1",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**错误码**:
- `401`: 未授权访问
- `404`: 素材不存在

---

### 4. 更新素材

**接口说明**: 更新素材信息

**请求方式**: `POST`

**接口路径**: `/api/v1/material/update`

**认证要求**: 需要JWT Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 素材ID | "material-id-1" |
| name | string | 否 | 素材名称 | "更新后的图片素材" |
| url | string | 否 | 素材URL | "https://example.com/updated-image.jpg" |
| type | string | 否 | 素材类型 | "image" |
| categoryId | string | 否 | 素材分类ID | "category-id-2" |

**请求示例**:
```json
{
  "id": "material-id-1",
  "name": "更新后的图片素材",
  "categoryId": "category-id-2"
}
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| message | string | 操作结果消息 | "素材更新成功" |

**响应示例**:
```json
{
  "code": 200,
  "message": "素材更新成功",
  "data": null
}
```

**错误码**:
- `400`: 请求参数错误
- `401`: 未授权访问
- `404`: 素材不存在

---

### 5. 删除素材

**接口说明**: 删除指定素材

**请求方式**: `POST`

**接口路径**: `/api/v1/material/delete`

**认证要求**: 需要JWT Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 素材ID | "material-id-1" |

**请求示例**:
```json
{
  "id": "material-id-1"
}
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| message | string | 操作结果消息 | "素材删除成功" |

**响应示例**:
```json
{
  "code": 200,
  "message": "素材删除成功",
  "data": null
}
```

**错误码**:
- `401`: 未授权访问
- `404`: 素材不存在

---

### 6. 批量删除素材

**接口说明**: 批量删除素材

**请求方式**: `POST`

**接口路径**: `/api/v1/material/batch-delete`

**认证要求**: 需要JWT Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| ids | array | 是 | 素材ID列表 | ["material-id-1", "material-id-2"] |

**请求示例**:
```json
{
  "ids": ["material-id-1", "material-id-2"]
}
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| message | string | 操作结果消息 | "批量删除成功" |

**响应示例**:
```json
{
  "code": 200,
  "message": "批量删除成功",
  "data": null
}
```

**错误码**:
- `401`: 未授权访问
- `400`: 请求参数错误

---

### 7. 切换素材状态

**接口说明**: 切换素材的启用/禁用状态

**请求方式**: `POST`

**接口路径**: `/api/v1/material/toggle-status`

**认证要求**: 需要JWT Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 素材ID | "material-id-1" |
| status | boolean | 是 | 目标状态 (true为启用，false为禁用) | true |

**请求示例**:
```json
{
  "id": "material-id-1",
  "status": true
}
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| message | string | 操作结果消息 | "素材状态切换成功" |

**响应示例**:
```json
{
  "code": 200,
  "message": "素材状态切换成功",
  "data": null
}
```

**错误码**:
- `401`: 未授权访问
- `404`: 素材不存在

---

## 数据模型

### CreateMaterialDto - 创建素材请求数据模型
```typescript
{
  name: string;    // 素材名称
  url: string;     // 素材URL
  type: string;    // 素材类型
  categoryId?: string; // 素材分类ID
}
```

### UpdateMaterialDto - 更新素材请求数据模型
```typescript
{
  id: string;      // 素材ID
  name?: string;   // 素材名称
  url?: string;    // 素材URL
  type?: string;   // 素材类型
  categoryId?: string; // 素材分类ID
}
```

### DeleteMaterialDto - 删除素材请求数据模型
```typescript
{
  id: string;      // 素材ID
}
```

### BatchDeleteMaterialDto - 批量删除素材请求数据模型
```typescript
{
  ids: string[];   // 素材ID列表
}
```

### ToggleMaterialStatusDto - 切换素材状态请求数据模型
```typescript
{
  id: string;      // 素材ID
  status: boolean; // 目标状态
}
```

### MaterialResponseDto - 素材响应数据模型
```typescript
{
  id: string;              // 素材ID
  name: string;            // 素材名称
  url: string;             // 素材URL
  type: string;            // 素材类型
  categoryId?: string;     // 素材分类ID
  createdAt: string;       // 创建时间
}
```

## 错误处理

所有接口都遵循统一的错误响应格式：

```json
{
  "statusCode": 400,
  "message": "错误描述信息",
  "error": "Bad Request"
}
```

常见错误码：
- `400`: 请求参数错误
- `401`: 未授权访问
- `404`: 资源不存在
- `500`: 服务器内部错误

## 安全要求

1. **认证**: 除特定公开接口外，所有接口都需要有效的JWT Token进行认证。
2. **授权**: 用户只能访问其拥有权限的素材资源。
3. **输入验证**: 所有用户输入都必须经过严格的验证，防止注入攻击和恶意数据。

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2024-01-01 | 初始版本发布 |