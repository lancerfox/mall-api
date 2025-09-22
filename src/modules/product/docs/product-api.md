# 商品管理模块 API 文档

## 概述
本文档详细描述了商品管理模块的所有API接口，包括商品分类管理和商品管理功能。

---

## 商品分类管理

### 1. 创建商品分类
- **接口路径**: `POST /product/category/create`
- **功能描述**: 创建新的商品分类
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| name | string | 是 | 分类名称 | "手机" |
| parentId | string | 否 | 父分类ID | "60d5f9b8f8b8b8b8b8b8b8b8" |
| sort | number | 否 | 排序值 | 1 |
| status | number | 否 | 状态（0-禁用，1-启用） | 1 |
| description | string | 否 | 分类描述 | "手机类商品" |

- **响应示例**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "_id": "60d5f9b8f8b8b8b8b8b8b8b8",
    "name": "手机",
    "parentId": null,
    "sort": 1,
    "status": 1,
    "description": "手机类商品",
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. 更新商品分类
- **接口路径**: `POST /product/category/update`
- **功能描述**: 更新商品分类信息
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| id | string | 是 | 分类ID | "60d5f9b8f8b8b8b8b8b8b8b8" |
| name | string | 否 | 分类名称 | "智能手机" |
| parentId | string | 否 | 父分类ID | "60d5f9b8f8b8b8b8b8b8b8b8" |
| sort | number | 否 | 排序值 | 2 |
| status | number | 否 | 状态 | 1 |
| description | string | 否 | 分类描述 | "智能手机类商品" |

- **响应示例**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "_id": "60d5f9b8f8b8b8b8b8b8b8b8",
    "name": "智能手机",
    "parentId": null,
    "sort": 2,
    "status": 1,
    "description": "智能手机类商品",
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T01:00:00.000Z"
  }
}
```

### 3. 删除商品分类
- **接口路径**: `POST /product/category/delete`
- **功能描述**: 删除商品分类
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| id | string | 是 | 分类ID | "60d5f9b8f8b8b8b8b8b8b8b8" |

- **响应示例**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 4. 获取商品分类列表
- **接口路径**: `POST /product/category/list`
- **功能描述**: 获取商品分类树形列表
- **请求参数**: 无
- **响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "_id": "60d5f9b8f8b8b8b8b8b8b8b8",
      "name": "手机",
      "parentId": null,
      "sort": 1,
      "status": 1,
      "description": "手机类商品",
      "createTime": "2024-01-01T00:00:00.000Z",
      "updateTime": "2024-01-01T00:00:00.000Z",
      "children": [
        {
          "_id": "60d5f9b8f8b8b8b8b8b8b8b9",
          "name": "智能手机",
          "parentId": "60d5f9b8f8b8b8b8b8b8b8b8",
          "sort": 1,
          "status": 1,
          "description": "智能手机",
          "createTime": "2024-01-01T00:00:00.000Z",
          "updateTime": "2024-01-01T00:00:00.000Z",
          "children": []
        }
      ]
    }
  ]
}
```

### 5. 获取商品分类详情
- **接口路径**: `POST /product/category/detail`
- **功能描述**: 获取单个商品分类详情
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| id | string | 是 | 分类ID | "60d5f9b8f8b8b8b8b8b8b8b8" |

- **响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "_id": "60d5f9b8f8b8b8b8b8b8b8b8",
    "name": "手机",
    "parentId": null,
    "sort": 1,
    "status": 1,
    "description": "手机类商品",
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 商品管理

### 1. 保存商品
- **接口路径**: `POST /product/save`
- **功能描述**: 保存商品信息（创建或更新草稿/发布）
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| action | string | 是 | 操作类型：save_draft-保存草稿，publish-发布 | "publish" |
| spu | object | 是 | 商品SPU信息 | 见下方 |
| skus | array | 是 | 商品SKU列表 | 见下方 |

**spu 对象结构**:
```json
{
  "id": "string", // 可选，更新时传
  "name": "string",
  "categoryId": "string",
  "description": "string",
  "mainImage": "string",
  "images": ["string"],
  "video": "string",
  "detail": "string"
}
```

**skus 数组结构**:
```json
[
  {
    "specifications": [
      {
        "name": "string",
        "value": "string"
      }
    ],
    "price": "number",
    "stock": "number",
    "image": "string"
  }
]
```

- **响应示例**:
```json
{
  "code": 200,
  "message": "保存成功",
  "data": {
    "_id": "60d5f9b8f8b8b8b8b8b8b8b8",
    "name": "iPhone 15",
    "categoryId": "60d5f9b8f8b8b8b8b8b8b8b8",
    "description": "最新款iPhone",
    "mainImage": "https://example.com/image.jpg",
    "images": ["https://example.com/image1.jpg"],
    "video": "https://example.com/video.mp4",
    "detail": "商品详情HTML",
    "status": "On-shelf",
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. 获取商品列表
- **接口路径**: `POST /product/list`
- **功能描述**: 分页获取商品列表
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| page | number | 是 | 页码 | 1 |
| pageSize | number | 是 | 每页数量 | 10 |
| filters | object | 否 | 筛选条件 | 见下方 |

**filters 对象结构**:
```json
{
  "name": "string", // 商品名称模糊搜索
  "id": "string",   // 商品ID精确匹配
  "categoryId": "string", // 分类ID
  "status": "string" // 状态：Draft, On-shelf, Off-shelf, Deleted
}
```

- **响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "_id": "60d5f9b8f8b8b8b8b8b8b8b8",
        "name": "iPhone 15",
        "categoryId": "60d5f9b8f8b8b8b8b8b8b8b8",
        "description": "最新款iPhone",
        "mainImage": "https://example.com/image.jpg",
        "status": "On-shelf",
        "createTime": "2024-01-01T00:00:00.000Z",
        "updateTime": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

### 3. 获取商品详情
- **接口路径**: `POST /product/detail`
- **功能描述**: 获取商品详情（包含SPU和SKU信息）
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| id | string | 是 | 商品ID | "60d5f9b8f8b8b8b8b8b8b8b8" |

- **响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "spu": {
      "_id": "60d5f9b8f8b8b8b8b8b8b8b8",
      "name": "iPhone 15",
      "categoryId": "60d5f9b8f8b8b8b8b8b8b8b8",
      "description": "最新款iPhone",
      "mainImage": "https://example.com/image.jpg",
      "images": ["https://example.com/image1.jpg"],
      "video": "https://example.com/video.mp4",
      "detail": "商品详情HTML",
      "status": "On-shelf",
      "createTime": "2024-01-01T00:00:00.000Z",
      "updateTime": "2024-01-01T00:00:00.000Z"
    },
    "skus": [
      {
        "_id": "60d5f9b8f8b8b8b8b8b8b8b9",
        "spuId": "60d5f9b8f8b8b8b8b8b8b8b8",
        "specifications": [
          {
            "name": "颜色",
            "value": "黑色"
          },
          {
            "name": "存储",
            "value": "128GB"
          }
        ],
        "price": 5999,
        "stock": 100,
        "image": "https://example.com/sku-image.jpg",
        "createTime": "2024-01-01T00:00:00.000Z",
        "updateTime": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 4. 更新商品状态
- **接口路径**: `POST /product/updateStatus`
- **功能描述**: 批量更新商品状态（上架/下架）
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| ids | array | 是 | 商品ID数组 | ["60d5f9b8f8b8b8b8b8b8b8b8"] |
| status | string | 是 | 目标状态：On-shelf, Off-shelf | "On-shelf" |

- **响应示例**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

### 5. 删除商品
- **接口路径**: `POST /product/delete`
- **功能描述**: 批量删除商品（软删除）
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| ids | array | 是 | 商品ID数组 | ["60d5f9b8f8b8b8b8b8b8b8b8"] |

- **响应示例**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

## 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 200 | 成功 | - |
| 4001 | 分类不存在 | 检查分类ID是否正确 |
| 4002 | 商品不存在 | 检查商品ID是否正确 |
| 4003 | 分类下存在子分类 | 请先删除子分类 |
| 4004 | 分类下存在商品 | 请先移除分类下的商品 |
| 5001 | 系统错误 | 联系管理员 |

---

## 更新记录

| 版本 | 日期 | 作者 | 说明 |
|------|------|------|------|
| v1.0 | 2024-01-01 | 系统 | 初始版本 |