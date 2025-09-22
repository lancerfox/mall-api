# 商品管理模块 - 后端开发文档

## 1. 概述

本文档基于《商品管理模块产品需求文档 (PRD)》编写，旨在为后端开发人员提供清晰的接口定义和数据模型。

### 1.1. 技术栈
- **框架**: NestJS
- **数据库**: MongoDB (根据项目结构推断)
- **请求方式**: 只使用 GET 和 POST

### 1.2. 接口设计原则
- **URL规范**: 接口路径清晰，体现资源层级，例如 `/api/product/category/create`。
- **无URL参数**: 所有请求参数通过 `body` 传递。
- **统一响应格式**:
  ```json
  {
    "code": 200, // 200: 成功, 其他: 失败
    "message": "success",
    "data": {} // 返回的数据
  }
  ```

---

## 2. 一期 (MVP) 功能接口

### 2.1. 商品分类管理

#### 2.1.1. 创建商品分类
- **接口**: `POST /api/product/category/create`
- **功能描述**: 新增一个商品分类。
- **请求体**:
  ```json
  {
    "parentId": "string", // 上级分类ID，如果是一级分类则为null或"0"。校验规则：可选，如果提供必须是有效的分类ID。
    "name": "string", // 分类名称 (必填)。校验规则：必填，字符串类型，长度1-50，同一层级下不可重复。
    "icon": "string", // 分类图标URL (非必填)。校验规则：可选，字符串类型，最大长度255，应为有效的URL格式。
    "sort": "number", // 排序号 (非必填，默认为0)。校验规则：可选，整数类型，范围0-9999。
    "status": "number" // 状态 (0: 隐藏, 1: 显示，默认为1)。校验规则：可选，整数类型，只能是0或1。
  }
  ```
- **返回体**:
  ```json
  {
    "code": 200,
    "message": "创建成功",
    "data": {
      "id": "string" // 新创建的分类ID
    }
  }
  ```

#### 2.1.2. 获取商品分类列表（树形）
- **接口**: `GET /api/product/category/list`
- **功能描述**: 以树形结构获取所有商品分类。
- **请求体**: (无)
- **返回体**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": [
      {
        "id": "string",
        "name": "string",
        "icon": "string",
        "sort": "number",
        "status": "number",
        "children": [
          // ... 子分类
        ]
      }
    ]
  }
  ```

#### 2.1.3. 更新商品分类
- **接口**: `POST /api/product/category/update`
- **功能描述**: 更新指定ID的商品分类信息。
- **请求体**:
  ```json
  {
    "id": "string", // 分类ID (必填)。校验规则：必填，字符串类型，必须是已存在的分类ID。
    "parentId": "string", // 上级分类ID。校验规则：可选，如果提供必须是有效的分类ID。
    "name": "string", // 分类名称。校验规则：可选，字符串类型，长度1-50，同一层级下不可重复。
    "icon": "string", // 分类图标URL。校验规则：可选，字符串类型，最大长度255，应为有效的URL格式。
    "sort": "number", // 排序号。校验规则：可选，整数类型，范围0-9999。
    "status": "number" // 状态。校验规则：可选，整数类型，只能是0或1。
  }
  ```
- **返回体**:
  ```json
  {
    "code": 200,
    "message": "更新成功",
    "data": null
  }
  ```

#### 2.1.4. 删除商品分类
- **接口**: `POST /api/product/category/delete`
- **功能描述**: 删除一个商品分类。
- **请求体**:
  ```json
  {
    "id": "string" // 要删除的分类ID (必填)。校验规则：必填，字符串类型，必须是已存在的分类ID。
  }
  ```
- **后端逻辑**:
  1. 检查该分类下是否有子分类。
  2. 检查该分类（及所有子分类）是否已关联商品。
  3. 满足删除条件方可删除。
- **返回体**:
  ```json
  {
    "code": 200,
    "message": "删除成功",
    "data": null
  }
  ```

### 2.2. 商品管理 (SPU & SKU)

#### 2.2.1. 创建/更新商品 (SPU & SKU)
- **接口**: `POST /api/product/save`
- **功能描述**: 创建或更新一个商品。通过 `id` 字段区分是创建还是更新。
- **请求体**:
  ```json
  {
    "spu": {
      "id": "string", // SPU ID，更新时必填，创建时为空。校验规则：更新时必填，字符串类型，必须是已存在的SPU ID。创建时为空。 
      "name": "string", // 商品名称 (必填)。校验规则：必填，字符串类型，长度1-200。
      "subtitle": "string", // 副标题。校验规则：可选，字符串类型，最大长度500。
      "categoryId": "string", // 末级分类ID (必填)。校验规则：必填，字符串类型，必须是已存在的末级分类ID。
      "mainImage": "string", // 主图URL。校验规则：可选，字符串类型，应为有效的URL格式。
      "video": "string", // 视频URL。校验规则：可选，字符串类型，应为有效的URL格式。
      "material": "string", // 材质 (必填)。校验规则：必填，字符串类型，长度1-50。
      "origin": "string", // 产地。校验规则：可选，字符串类型，长度1-50。
      "grade": "string", // 品级。校验规则：可选，字符串类型，长度1-50。
      "description": "string", // 商品详情 (富文本)。校验规则：可选，字符串类型，最大长度2000。
      "freight": "number", // 固定运费。校验规则：可选，数字类型，非负数。
      "sort": "number" // 排序。校验规则：可选，整数类型，范围0-9999。
    },
    "skus": [
      {
        "id": "string", // SKU ID，更新时必填，创建时为空。校验规则：更新时必填，字符串类型，必须是已存在的SKU ID。创建时为空。
        "specifications": [
          { "key": "珠子直径", "value": "8mm" }
        ], // 规格属性列表 (必填)。校验规则：必填，数组类型，每个元素包含key和value字段。
        "image": "string", // SKU图片 (非必填)。校验规则：可选，字符串类型，应为有效的URL格式。
        "price": "number", // 销售价 (必填)。校验规则：必填，数字类型，大于0。
        "marketPrice": "number", // 市场价 (非必填)。校验规则：可选，数字类型，大于0。
        "stock": "number", // 库存 (必填)。校验规则：必填，整数类型，大于等于0。
        "skuCode": "string", // SKU编码 (非必填)。校验规则：可选，字符串类型，唯一。
        "status": "number" // 状态 (0: 禁用, 1: 启用)。校验规则：可选，整数类型，只能是0或1。
      }
    ],
    "action": "string" // 操作类型: "saveToDraft" | "publish"
  }
  ```
- **后端逻辑**:
  1. 如果 `action` 是 `publish`，则校验所有必填项，并将商品状态置为“销售中”。
  2. 如果 `action` 是 `saveToDraft`，则保存信息，商品状态置为“草稿”。
- **返回体**:
  ```json
  {
    "code": 200,
    "message": "保存成功",
    "data": {
      "spuId": "string"
    }
  }
  ```

#### 2.2.2. 获取商品列表 (SPU维度)
- **接口**: `POST /api/product/list`
- **功能描述**: 根据条件分页查询SPU列表。
- **请求体**:
  ```json
  {
    "page": "number", // 页码 (必填)。校验规则：必填，整数类型，大于等于1。
    "pageSize": "number", // 每页数量 (必填)。校验规则：必填，整数类型，大于等于1。
    "filters": {
      "name": "string", // 商品名称 (模糊搜索)。校验规则：可选，字符串类型，最大长度200。
      "id": "string", // 商品ID (精确搜索)。校验规则：可选，字符串类型，必须是有效的SPU ID。
      "categoryId": "string", // 分类ID。校验规则：可选，字符串类型，必须是有效的分类ID。
      "status": "string" // 商品状态: "Draft" | "On-shelf" | "Off-shelf"。校验规则：可选，字符串类型，只能是"Draft", "On-shelf", "Off-shelf"之一。
    }
  }
  ```
- **返回体**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "total": "number",
      "list": [
        {
          "id": "string",
          "mainImage": "string",
          "name": "string",
          "categoryName": "string",
          "material": "string",
          "priceRange": "string", // "100.00-200.00"
          "totalStock": "number",
          "status": "string",
          "createdAt": "date"
        }
      ]
    }
  }
  ```

#### 2.2.3. 获取商品详情
- **接口**: `POST /api/product/detail`
- **功能描述**: 获取单个SPU及其下所有SKU的完整信息。
- **请求体**:
  ```json
  {
    "id": "string" // SPU ID (必填)。校验规则：必填，字符串类型，必须是已存在的SPU ID。
  }
  ```
- **返回体**: (结构同 `POST /api/product/save` 的请求体，但不包含 `action` 字段)

#### 2.2.4. 更新商品状态
- **接口**: `POST /api/product/update/status`
- **功能描述**: 上架、下架或删除商品。
- **请求体**:
  ```json
  {
    "ids": ["string"], // SPU ID列表 (必填)。校验规则：必填，数组类型，每个元素必须是已存在的SPU ID。
    "status": "string" // 目标状态: "On-shelf" | "Off-shelf" | "Deleted" (必填)。校验规则：必填，字符串类型，只能是"On-shelf", "Off-shelf", "Deleted"之一。
  }
  ```
- **返回体**:
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": null
  }
  ```

---

## 3. 二期 (优化迭代) 功能接口

### 3.1. 商品属性管理 (材质、产地等)

#### 3.1.1. 创建商品属性
- **接口**: `POST /api/product/attribute/create`
- **请求体**: `{"name": "string", "type": "material"}`
- **返回体**: `{"id": "string"}`

#### 3.1.2. 获取商品属性列表
- **接口**: `POST /api/product/attribute/list`
- **请求体**: `{"type": "material"}`
- **返回体**: `[{"id": "string", "name": "string"}]`

#### 3.1.3. 删除商品属性
- **接口**: `POST /api/product/attribute/delete`
- **请求体**: `{"id": "string"}`

### 3.2. 商品规格模板

#### 3.2.1. 创建规格模板
- **接口**: `POST /api/product/specification/template/create`
- **请求体**: `{"name": "默认直径", "specifications": [{"key": "珠子直径", "values": ["6mm", "8mm"]}]}`

#### 3.2.2. 获取规格模板列表
- **接口**: `GET /api/product/specification/template/list`

### 3.3. 操作日志

#### 3.3.1. 获取商品操作日志
- **接口**: `POST /api/product/log/list`
- **请求体**: `{"productId": "string", "page": 1, "pageSize": 10}`
- **返回体**: 列表包含 `operator`, `timestamp`, `action`, `details`。