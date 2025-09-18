# 材料管理模块接口文档

## 概述

材料管理模块提供材料的增删改查、批量操作、分类管理、状态控制以及操作日志记录等功能。所有接口都遵循RESTful设计原则。

## 基础信息

- **基础路径**: `/api/material`、`/api/operation-log`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`

## 接口列表

### 1. 获取材料列表

**接口说明**: 分页查询材料列表，支持多种筛选条件

**请求方式**: `POST`

**接口路径**: `/api/material/list`

**认证要求**: 需要JWT Token

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| page | number | 是 | 页码，最小值1 | 1 |
| pageSize | number | 是 | 每页数量，可选值：10, 20, 50 | 20 |
| keyword | string | 否 | 搜索关键词，最大50字符 | "红玛瑙" |
| categoryId | string | 否 | 分类ID | "C001" |
| categoryIds | array | 否 | 分类ID数组 | ["C001", "C002"] |
| status | string | 否 | 状态筛选，可选：'', 'enabled', 'disabled' | "enabled" |
| statuses | array | 否 | 状态数组 | ["enabled", "disabled"] |
| priceMin | number | 否 | 最低价格，最小值0 | 10.0 |
| priceMax | number | 否 | 最高价格，最小值0 | 100.0 |
| stockMin | number | 否 | 最低库存，最小值0 | 0 |
| stockMax | number | 否 | 最高库存，最小值0 | 1000 |
| colors | array | 否 | 颜色数组 | ["红色", "蓝色"] |
| hardnessMin | number | 否 | 最低硬度，范围1-10 | 1 |
| hardnessMax | number | 否 | 最高硬度，范围1-10 | 10 |
| densityMin | number | 否 | 最低密度，最小值0 | 1.0 |
| densityMax | number | 否 | 最高密度，最小值0 | 5.0 |
| dateStart | string | 否 | 开始日期 | "2024-01-01" |
| dateEnd | string | 否 | 结束日期 | "2024-12-31" |
| sortBy | string | 否 | 排序字段，可选：'name', 'price', 'stock', 'createdAt', 'updatedAt' | "createdAt" |
| sortOrder | string | 否 | 排序方向，可选：'asc', 'desc' | "desc" |

**请求示例**:
```json
{
  "page": 1,
  "pageSize": 20,
  "keyword": "红玛瑙",
  "categoryId": "C001",
  "status": "enabled",
  "priceMin": 10.0,
  "priceMax": 100.0,
  "sortBy": "createdAt",
  "sortOrder": "desc"
}
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| list | array | 材料列表 | - |
| list[].materialId | string | 材料ID | "M001" |
| list[].name | string | 材料名称 | "红玛瑙" |
| list[].categoryId | string | 分类ID | "C001" |
| list[].categoryName | string | 分类名称 | "宝石类" |
| list[].categoryPath | string | 分类路径 | "宝石类/玛瑙" |
| list[].price | number | 价格 | 15.5 |
| list[].stock | number | 库存数量 | 100 |
| list[].description | string | 材料描述 | "天然红玛瑙" |
| list[].color | string | 颜色 | "红色" |
| list[].hardness | number | 硬度 | 7 |
| list[].density | number | 密度 | 2.65 |
| list[].status | string | 状态 | "enabled" |
| list[].images | array | 图片列表 | [] |
| list[].stats | object | 统计信息 | - |
| list[].createdAt | string | 创建时间 | "2024-01-01T00:00:00.000Z" |
| list[].updatedAt | string | 更新时间 | "2024-01-01T00:00:00.000Z" |
| list[].createdBy | string | 创建人ID | "user123" |
| list[].updatedBy | string | 更新人ID | "user123" |
| total | number | 总记录数 | 100 |
| page | number | 当前页码 | 1 |
| pageSize | number | 每页数量 | 20 |

**响应示例**:
```json
{
  "list": [
    {
      "materialId": "M001",
      "name": "红玛瑙",
      "categoryId": "C001",
      "categoryName": "宝石类",
      "categoryPath": "宝石类/玛瑙",
      "price": 15.5,
      "stock": 100,
      "description": "天然红玛瑙",
      "color": "红色",
      "hardness": 7,
      "density": 2.65,
      "status": "enabled",
      "images": [],
      "stats": {
        "viewCount": 150,
        "editCount": 5
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "createdBy": "user123",
      "updatedBy": "user123"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

**错误码**:
- `400`: 参数错误
- `401`: 未授权
- `500`: 服务器内部错误

---

### 2. 获取材料详情

**接口说明**: 根据材料ID获取单个材料的详细信息

**请求方式**: `GET`

**接口路径**: `/api/material/detail`

**认证要求**: 需要JWT Token

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| materialId | string | 是 | 材料ID | "M001" |
| enhanced | boolean | 否 | 是否包含增强信息（分类路径、图片、统计信息等），默认false | true |

**请求示例**:
```
GET /api/material/detail?materialId=M001&enhanced=true
```

**响应参数**: 同材料列表中的单个材料对象

**响应示例**:
```json
{
  "materialId": "M001",
  "name": "红玛瑙",
  "categoryId": "C001",
  "categoryName": "宝石类",
  "categoryPath": "宝石类/玛瑙",
  "price": 15.5,
  "stock": 100,
  "description": "天然红玛瑙",
  "color": "红色",
  "hardness": 7,
  "density": 2.65,
  "status": "enabled",
  "images": [],
  "stats": {
    "viewCount": 150,
    "editCount": 5,
    "lastViewAt": "2024-01-01T00:00:00.000Z",
    "lastEditAt": "2024-01-01T00:00:00.000Z"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "createdBy": "user123",
  "updatedBy": "user123"
}
```

**错误码**:
- `400`: 参数错误
- `401`: 未授权
- `404`: 材料不存在  
- `500`: 服务器内部错误

---

### 3. 创建材料

**接口说明**: 创建新的材料

**请求方式**: `POST`

**接口路径**: `/api/material/create`

**认证要求**: 需要JWT Token

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|--------|------|------|------|----------|------|
| name | string | 是 | 材料名称 | 2-50字符 | "红玛瑙" |
| categoryId | string | 是 | 分类ID | 非空字符串 | "60f1b2b3b3b3b3b3b3b3b3b3" |
| price | number | 是 | 价格 | 最小值0，最大2位小数 | 15.5 |
| stock | number | 是 | 库存数量 | 最小值0的整数 | 100 |
| description | string | 否 | 材料描述 | 最大500字符 | "天然红玛瑙" |
| color | string | 否 | 颜色 | 最大20字符 | "红色" |
| hardness | number | 否 | 硬度 | 1-10的整数 | 7 |
| density | number | 否 | 密度 | 最小值0 | 2.65 |
| status | string | 否 | 状态，默认'enabled' | 'enabled'或'disabled' | "enabled" |

**请求示例**:
```json
{
  "name": "红玛瑙",
  "categoryId": "60f1b2b3b3b3b3b3b3b3b3b3",
  "price": 15.5,
  "stock": 100,
  "description": "天然红玛瑙",
  "color": "红色",
  "hardness": 7,
  "density": 2.65,
  "status": "enabled"
}
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| materialId | string | 创建的材料ID | "M001" |

**响应示例**:
```json
{
  "materialId": "M001"
}
```

**错误码**:
- `400`: 参数错误
- `401`: 未授权
- `409`: 材料ID已存在
- `500`: 服务器内部错误

---

### 4. 更新材料

**接口说明**: 更新指定材料的信息

**请求方式**: `POST`

**接口路径**: `/api/material/update`

**认证要求**: 需要JWT Token

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|--------|------|------|------|----------|------|
| materialId | string | 是 | 材料ID | 非空字符串 | "M001" |
| name | string | 是 | 材料名称 | 2-50字符 | "红玛瑙" |
| categoryId | string | 是 | 分类ID | 非空字符串 | "60f1b2b3b3b3b3b3b3b3b3b3" |
| price | number | 是 | 价格 | 最小值0，最大2位小数 | 15.5 |
| stock | number | 是 | 库存数量 | 最小值0的整数 | 100 |
| description | string | 否 | 材料描述 | 最大500字符 | "天然红玛瑙" |
| color | string | 否 | 颜色 | 最大20字符 | "红色" |
| hardness | number | 否 | 硬度 | 1-10的整数 | 7 |
| density | number | 否 | 密度 | 最小值0 | 2.65 |
| status | string | 是 | 状态 | 'enabled'或'disabled' | "enabled" |

**请求示例**:
```json
{
  "materialId": "M001",
  "name": "红玛瑙",
  "categoryId": "60f1b2b3b3b3b3b3b3b3b3b3",
  "price": 18.5,
  "stock": 120,
  "description": "优质天然红玛瑙",
  "color": "红色",
  "hardness": 7,
  "density": 2.65,
  "status": "enabled"
}
```

**响应参数**: 无特定响应内容（返回null）

**响应示例**:
```json
null
```

**错误码**:
- `400`: 参数错误
- `401`: 未授权
- `404`: 材料不存在
- `500`: 服务器内部错误

---

### 5. 删除材料

**接口说明**: 删除指定的材料

**请求方式**: `POST`

**接口路径**: `/api/material/delete`

**认证要求**: 需要JWT Token

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| materialId | string | 是 | 要删除的材料ID | "M001" |

**请求示例**:
```json
{
  "materialId": "M001"
}
```

**响应参数**: 无特定响应内容（返回null）

**响应示例**:
```json
null
```

**错误码**:
- `400`: 参数错误
- `401`: 未授权
- `404`: 材料不存在
- `500`: 服务器内部错误

---

## 数据模型

### MaterialListDto - 材料列表查询参数
```typescript
{
  page: number;                    // 页码
  pageSize: number;               // 每页数量 (10, 20, 50)
  keyword?: string;               // 搜索关键词，最长50字符
  categoryId?: string;            // 分类ID
  categoryIds?: string[];         // 分类ID数组
  status?: string;                // 状态筛选
  statuses?: string[];            // 状态数组
  priceMin?: number;              // 最低价格
  priceMax?: number;              // 最高价格
  stockMin?: number;              // 最低库存
  stockMax?: number;              // 最高库存
  colors?: string[];              // 颜色数组
  hardnessMin?: number;           // 最低硬度 (1-10)
  hardnessMax?: number;           // 最高硬度 (1-10)
  densityMin?: number;            // 最低密度
  densityMax?: number;            // 最高密度
  dateStart?: string;             // 开始日期
  dateEnd?: string;               // 结束日期
  sortBy?: string;                // 排序字段
  sortOrder?: string;             // 排序方向 (asc, desc)
}
```

### CreateMaterialDto - 创建材料请求数据模型
```typescript
{
  name: string;                   // 材料名称，2-50字符
  categoryId: string;             // 分类ID
  price: number;                  // 价格，最小值0，最多2位小数
  stock: number;                  // 库存数量，最小值0的整数
  description?: string;           // 材料描述，最大500字符
  color?: string;                 // 颜色，最长20字符
  hardness?: number;              // 硬度，1-10的整数
  density?: number;               // 密度，最小值0
  status?: string;                // 状态，'enabled'或'disabled'
}
```

### MaterialResponseDto - 材料响应数据模型
```typescript
{
  materialId: string;             // 材料ID
  name: string;                   // 材料名称
  categoryId: string;             // 分类ID
  categoryName?: string;          // 分类名称
  categoryPath?: string;          // 分类路径
  price: number;                  // 价格
  stock: number;                  // 库存数量
  description?: string;           // 材料描述
  color?: string;                 // 颜色
  hardness?: number;              // 硬度
  density?: number;               // 密度
  status: string;                 // 状态
  images?: any[];                 // 图片列表
  stats?: MaterialStatsDto;       // 统计信息
  createdAt: Date;                // 创建时间
  updatedAt: Date;                // 更新时间
  createdBy: string;              // 创建人ID
  updatedBy: string;              // 更新人ID
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
- `409`: 资源冲突（如材料ID已存在）
- `500`: 服务器内部错误

## 安全要求

1. **认证授权**: 除了公开接口外，所有接口都需要JWT认证
2. **参数验证**: 所有输入参数都经过严格的格式和范围验证
3. **权限控制**: 根据用户角色控制接口访问权限
4. **操作日志**: 所有关键操作都会记录详细的操作日志

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2024-01-18 | 初始版本发布 |