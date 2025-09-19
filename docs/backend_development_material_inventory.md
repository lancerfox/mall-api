# 后端开发文档 - 素材与库存管理优化

## 1. 概述

本文档基于《产品需求文档 (PRD) - 素材与库存管理优化》进行编写，旨在为后端开发提供清晰的接口和数据模型变更指引。

核心变更：
- **模块拆分**：将原有的素材管理功能拆分为 **素材管理** 和 **库存管理** 两个独立的模块。
- **功能新增**：新增 **库存操作记录** 模块，用于追踪库存和价格的变更历史。
- **删除机制**：素材删除采用软删除策略。

## 2. 数据模型变更

### 2.1. `Material` (素材) 实体 - 修改

为了支持软删除，我们需要在 `material.entity.ts` 中的 `Material` 实体中增加一个字段。

- **新增字段**:
  - `deletedAt`: `Date` (或 `DateTime`) 类型，可为空。当该字段有值时，表示该素材已被软删除。

### 2.2. `Inventory` (库存) 实体 - 新增

创建一个新的实体来管理库存信息。

- **实体名称**: `Inventory`
- **建议字段**:
  - `inventoryId`: `string` (主键, UUID 或 ObjectId)
  - `material`: `Material` (与素材实体建立一对一关联)
  - `price`: `number` (价格，建议使用 Decimal 类型以保证精度)
  - `stock`: `number` (库存数量，整数)
  - `status`: `string` (上架状态, 枚举类型, 例如: `'on_shelf'`, `'off_shelf'`)
  - `createdAt`: `Date`
  - `updatedAt`: `Date`

### 2.3. `InventoryLog` (库存操作记录) 实体 - 新增

创建一个新的实体来记录库存相关的操作。

- **实体名称**: `InventoryLog`
- **建议字段**:
  - `logId`: `string` (主键, UUID 或 ObjectId)
  - `operatorId`: `string` (操作员ID)
  - `operatorName`: `string` (操作员名称)
  - `materialId`: `string` (关联的素材ID)
  - `materialName`: `string` (关联的素材名称)
  - `operationType`: `string` (操作类型, 枚举类型, 例如: `'update_stock'`, `'update_price'`)
  - `beforeValue`: `string` (操作前的值，序列化后的字符串)
  - `afterValue`: `string` (操作后的值，序列化后的字符串)
  - `remark`: `string` (备注，可选)
  - `createdAt`: `Date`

## 3. API 接口变更

### 3.1. 素材管理 (`/materials`) - 接口修改

#### 3.1.1. `POST /materials/create` - 创建素材

- **描述**: 创建新素材时，不再处理价格和库存。创建成功后，系统需自动在库存表中创建一条关联记录。
- **请求体 (Body)**:
  ```json
  {
    "name": "string",
    "categoryId": "string",
    "description": "string",
    // ... 其他素材基础信息字段
    // 移除 price 和 stock 字段
  }
  ```
- **后端逻辑**:
  1. 保存新的素材信息。
  2. 创建一条关联的 `Inventory` 记录，设置 `price = 0`, `stock = 0`, `status = 'off_shelf'`。

#### 3.1.2. `POST /materials/update` - 更新素材

- **描述**: 更新素材时，不再允许修改价格和库存。
- **请求体 (Body)**:
  ```json
  {
    "materialId": "string",
    "name": "string",
    // ... 其他可编辑的素材基础信息字段
    // 移除 price 和 stock 字段
  }
  ```

#### 3.1.3. `POST /materials/delete` - 删除素材

- **描述**: 实现软删除。
- **请求体 (Body)**:
  ```json
  {
    "materialId": "string"
  }
  ```
- **后端逻辑**:
  1. 检查该素材在 `Inventory` 表中的状态。如果 `status` 为 `'on_shelf'`，则禁止删除，并返回错误信息。
  2. 如果允许删除，则将 `Material` 实体中的 `deletedAt` 字段更新为当前时间。

#### 3.1.4. `GET /materials/list` - 获取素材列表

- **描述**: 返回的列表中不再包含价格和库存信息。
- **响应体 (Response Body)**:
  ```json
  {
    "code": 200,
    "data": {
      "list": [
        {
          "materialId": "string",
          "name": "string",
          // ... 其他素材基础信息字段
          // 移除 price 和 stock 字段
        }
      ],
      "total": "number"
    }
  }
  ```

### 3.2. 库存管理 (`/inventory`) - 新增接口

#### 3.2.1. `GET /inventory/list` - 获取库存列表

- **描述**: 分页获取所有未被软删除的素材的库存信息。
- **请求参数 (Query)**:
  - `page`: `number`
  - `pageSize`: `number`
  - `keyword`: `string` (按素材名称模糊搜索)
  - `categoryId`: `string`
  - `status`: `string` (e.g., `'on_shelf'`, `'off_shelf'`)
- **响应体 (Response Body)**:
  ```json
  {
    "code": 200,
    "data": {
      "list": [
        {
          "inventoryId": "string",
          "materialId": "string",
          "materialName": "string",
          "categoryName": "string",
          "price": "number",
          "stock": "number",
          "status": "string"
        }
      ],
      "total": "number"
    }
  }
  ```

#### 3.2.2. `POST /inventory/update` - 修改库存和价格

- **描述**: 统一接口用于修改指定素材的库存和价格。
- **请求体 (Body)**:
  ```json
  {
    "inventoryId": "string",
    "price": "number", // 可选
    "stock": "number"  // 可选
  }
  ```
- **后端逻辑**:
  1. 校验 `inventoryId` 是否存在。
  2. 如果 `price` 字段存在，记录价格变更日志到 `InventoryLog`。
  3. 如果 `stock` 字段存在，记录库存变更日志到 `InventoryLog`。
  4. 更新 `Inventory` 表中的 `price` 和/或 `stock`。

#### 3.2.3. `POST /inventory/shelve` - 上架

- **描述**: 将一个或多个素材上架。
- **请求体 (Body)**:
  ```json
  {
    "inventoryIds": ["string"]
  }
  ```
- **后端逻辑**:
  1. 遍历 `inventoryIds`。
  2. 将对应记录的 `status` 更新为 `'on_shelf'`。

#### 3.2.4. `POST /inventory/unshelve` - 下架

- **描述**: 将一个或多个素材下架。
- **请求体 (Body)**:
  ```json
  {
    "inventoryIds": ["string"]
  }
  ```
- **后端逻辑**:
  1. 遍历 `inventoryIds`。
  2. 将对应记录的 `status` 更新为 `'off_shelf'`。

### 3.3. 库存操作记录 (`/inventory-logs`) - 新增接口

#### 3.3.1. `GET /inventory-logs/list` - 获取操作记录列表

- **描述**: 分页获取库存和价格的操作历史记录。
- **请求参数 (Query)**:
  - `page`: `number`
  - `pageSize`: `number`
  - `operatorName`: `string`
  - `materialName`: `string`
  - `startDate`: `string` (e.g., 'YYYY-MM-DD')
  - `endDate`: `string` (e.g., 'YYYY-MM-DD')
- **响应体 (Response Body)**:
  ```json
  {
    "code": 200,
    "data": {
      "list": [
        {
          "logId": "string",
          "operatorName": "string",
          "materialName": "string",
          "operationType": "string",
          "beforeValue": "string",
          "afterValue": "string",
          "createdAt": "string"
        }
      ],
      "total": "number"
    }
  }
  ```