# 分类模块接口文档

## 概述

分类模块提供商品分类的创建、查询、更新、删除以及层级管理等功能。所有接口都遵循RESTful设计原则。

## 基础信息

- **基础路径**: `/api/category`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`

## 接口列表

### 1. 创建分类

**接口说明**: 创建新的商品分类

**请求方式**: `POST`

**接口路径**: `/api/v1/category/create`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| name | string | 是 | 分类名称 | "电子产品" |
| parentId | string | 否 | 父分类ID (一级分类可为空) | "parent-category-id" |
| description | string | 否 | 分类描述 | "包含手机、电脑等" |
| sortOrder | number | 否 | 排序值 | 1 |

**请求示例**:
```json
{
  "name": "电子产品",
  "parentId": null,
  "description": "包含手机、电脑等",
  "sortOrder": 1
}
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | string | 分类ID | "category-id-1" |
| name | string | 分类名称 | "电子产品" |
| parentId | string | 父分类ID | null |
| description | string | 分类描述 | "包含手机、电脑等" |
| sortOrder | number | 排序值 | 1 |
| createdAt | string | 创建时间 | "2024-01-01T00:00:00.000Z" |

**响应示例**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": "category-id-1",
    "name": "电子产品",
    "parentId": null,
    "description": "包含手机、电脑等",
    "sortOrder": 1,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**错误码**:
- `400`: 请求参数错误
- `401`: 未授权访问

---

### 2. 获取分类列表 (树形结构)

**接口说明**: 获取所有商品分类，以树形结构返回

**请求方式**: `GET`

**接口路径**: `/api/v1/category/tree`

**认证要求**: 需要JWT Token

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | string | 分类ID | "category-id-1" |
| name | string | 分类名称 | "电子产品" |
| children | array | 子分类列表 | [...] |

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": "category-id-1",
      "name": "电子产品",
      "children": [
        {
          "id": "category-id-2",
          "name": "手机",
          "children": []
        }
      ]
    }
  ]
}
```

**错误码**:
- `401`: 未授权访问

---

### 3. 获取分类详情

**接口说明**: 根据分类ID获取分类详情

**请求方式**: `GET`

**接口路径**: `/api/v1/category/:id`

**认证要求**: 需要JWT Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 分类ID | "category-id-1" |

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | string | 分类ID | "category-id-1" |
| name | string | 分类名称 | "电子产品" |
| parentId | string | 父分类ID | null |
| description | string | 分类描述 | "包含手机、电脑等" |
| sortOrder | number | 排序值 | 1 |
| createdAt | string | 创建时间 | "2024-01-01T00:00:00.000Z" |

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": "category-id-1",
    "name": "电子产品",
    "parentId": null,
    "description": "包含手机、电脑等",
    "sortOrder": 1,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**错误码**:
- `401`: 未授权访问
- `404`: 分类不存在

---

### 4. 更新分类

**接口说明**: 更新分类信息

**请求方式**: `POST`

**接口路径**: `/api/v1/category/update`

**认证要求**: 需要JWT Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 分类ID | "category-id-1" |
| name | string | 否 | 分类名称 | "数码产品" |
| parentId | string | 否 | 父分类ID | "new-parent-id" |
| description | string | 否 | 分类描述 | "更新后的描述" |
| sortOrder | number | 否 | 排序值 | 2 |

**请求示例**:
```json
{
  "id": "category-id-1",
  "name": "数码产品",
  "sortOrder": 2
}
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| message | string | 操作结果消息 | "分类更新成功" |

**响应示例**:
```json
{
  "code": 200,
  "message": "分类更新成功",
  "data": null
}
```

**错误码**:
- `400`: 请求参数错误
- `401`: 未授权访问
- `404`: 分类不存在

---

### 5. 删除分类

**接口说明**: 删除指定分类

**请求方式**: `POST`

**接口路径**: `/api/v1/category/delete`

**认证要求**: 需要JWT Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 分类ID | "category-id-1" |

**请求示例**:
```json
{
  "id": "category-id-1"
}
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| message | string | 操作结果消息 | "分类删除成功" |

**响应示例**:
```json
{
  "code": 200,
  "message": "分类删除成功",
  "data": null
}
```

**错误码**:
- `401`: 未授权访问
- `404`: 分类不存在
- `409`: 存在子分类，无法删除

---

### 6. 移动分类

**接口说明**: 移动分类到新的父分类下

**请求方式**: `POST`

**接口路径**: `/api/v1/category/move`

**认证要求**: 需要JWT Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 要移动的分类ID | "category-id-1" |
| newParentId | string | 否 | 新的父分类ID (移动到根目录可为空) | "new-parent-id" |

**请求示例**:
```json
{
  "id": "category-id-1",
  "newParentId": "new-parent-id"
}
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| message | string | 操作结果消息 | "分类移动成功" |

**响应示例**:
```json
{
  "code": 200,
  "message": "分类移动成功",
  "data": null
}
```

**错误码**:
- `400`: 请求参数错误 (例如，不能移动到自身或子分类下)
- `401`: 未授权访问
- `404`: 分类不存在

---

## 数据模型

### CreateCategoryDto - 创建分类请求数据模型
```typescript
{
  name: string;        // 分类名称
  parentId?: string;   // 父分类ID
  description?: string; // 分类描述
  sortOrder?: number;  // 排序值
}
```

### UpdateCategoryDto - 更新分类请求数据模型
```typescript
{
  id: string;          // 分类ID
  name?: string;       // 分类名称
  parentId?: string;   // 父分类ID
  description?: string; // 分类描述
  sortOrder?: number;  // 排序值
}
```

### DeleteCategoryDto - 删除分类请求数据模型
```typescript
{
  id: string;          // 分类ID
}
```

### MoveCategoryDto - 移动分类请求数据模型
```typescript
{
  id: string;          // 要移动的分类ID
  newParentId?: string; // 新的父分类ID
}
```

### CategoryResponseDto - 分类响应数据模型
```typescript
{
  id: string;          // 分类ID
  name: string;        // 分类名称
  parentId?: string;   // 父分类ID
  description?: string; // 分类描述
  sortOrder?: number;  // 排序值
  createdAt: string;   // 创建时间
  children?: CategoryResponseDto[]; // 子分类列表 (树形结构时)
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
- `409`: 业务冲突 (例如，存在子分类无法删除)
- `500`: 服务器内部错误

## 安全要求

1. **认证**: 所有接口都需要有效的JWT Token进行认证。
2. **授权**: 用户只能操作其拥有权限的分类资源。
3. **输入验证**: 所有用户输入都必须经过严格的验证，防止恶意数据。

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2024-01-01 | 初始版本发布 |