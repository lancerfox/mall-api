# 后端开发任务文档: 图片管理模块

---

## 1. 概述

本文档基于《产品需求文档 (PRD): 图片管理功能》进行编写，旨在为图片管理模块的后端开发提供清晰、准确的技术指引。

- **模块功能**: 提供一个集中式的图片管理服务，支持图片的上传、存储、查询以及与商品模块的关联管理。
- **技术栈**: NestJS, TypeScript, Supabase (用于对象存储)。

---

## 2. 接口设计原则

- **请求方法**:
  - `GET`: 用于所有数据查询请求。
  - `POST`: 用于所有数据变更（增、删、改）操作。
- **路径 (Endpoint)**: 接口路径清晰描述功能，所有参数通过请求体传递。
- **响应体**: 遵循项目统一的 `IApiResponse` 结构。

---

## 3. 数据模型

根据 PRD 定义，涉及以下核心数据表：

- **`IMAGE`**: 存储图片的基础信息。
- **`PRODUCT_IMAGE`**: 存储商品与图片的关联关系、排序和主图信息。

```mermaid
erDiagram
    PRODUCT ||--o{ PRODUCT_IMAGE : "has"
    IMAGE ||--o{ PRODUCT_IMAGE : "is used in"

    PRODUCT {
        int id PK "商品ID"
        string name "商品名称"
        --
    }

    IMAGE {
        int id PK "图片ID"
        string url "图片公网URL (Supabase)"
        string path "图片在Supabase中的路径"
        datetime createdAt "上传时间"
        --
    }

    PRODUCT_IMAGE {
        int product_id FK "商品ID"
        int image_id FK "图片ID"
        int sort_order "显示顺序"
        bool is_main "是否为主图"
    }
```

---

## 4. 功能模块接口详述

### 4.1. 图片上传与入库

#### 4.1.1. 获取图片上传凭证

- **功能描述**: 前端在上传图片前，调用此接口获取一个有时效性的、预签名的 Supabase 上传 URL。
- **接口路径**: `POST /image/getUploadToken`
- **请求体 (Request Body)**:

  ```json
  {
    "fileName": "product-image-01.png",
    "fileType": "image/png"
  }
  ```

- **字段校验规则**:

| 字段名 (Field) | 类型 (Type) | 是否必填 (Required) | 校验规则/备注 (Validation/Note) |
| :--- | :--- | :--- | :--- |
| `fileName` | `string` | 是 | 必须是合法的图片文件名 (e.g., .png, .jpg, .gif) |
| `fileType` | `string` | 是 | 必须是合法的图片 MIME 类型 (e.g., image/png) |

- **响应体 (Response Body)**:

  ```json
  {
    "code": 200,
    "message": "获取上传凭证成功",
    "data": {
      "signedUrl": "https://<project>.supabase.co/storage/v1/object/upload/bucket/images/product-image-01.png?token=...",
      "path": "images/product-image-01.png"
    }
  }
  ```

- **后端业务逻辑**:
  1.  接收请求，校验 `fileName` 和 `fileType` 的合法性。
  2.  调用 Supabase Admin SDK 的 `createSignedUploadUrl` 方法生成预签名 URL。
  3.  URL 的有效期应设置为一个较短的时间（如 60 秒）。
  4.  返回 `signedUrl` 和文件在 Supabase 中的 `path`。

#### 4.1.2. 创建图片记录 (入库)

- **功能描述**: 前端在成功将图片直传到 Supabase 后，调用此接口将图片的公网 URL 等信息保存到我方数据库。
- **接口路径**: `POST /image/create`
- **请求体 (Request Body)**:

  ```json
  {
    "url": "https://<project>.supabase.co/storage/v1/object/public/bucket/images/product-image-01.png",
    "path": "images/product-image-01.png",
    "name": "product-image-01.png",
    "size": 102400
  }
  ```

- **字段校验规则**:

| 字段名 (Field) | 类型 (Type) | 是否必填 (Required) | 校验规则/备注 (Validation/Note) |
| :--- | :--- | :--- | :--- |
| `url` | `string` | 是 | 必须是合法的 URL 格式 |
| `path` | `string` | 是 | 图片在 Supabase 中的路径 |
| `name` | `string` | 是 | 图片文件名 |
| `size` | `number` | 否 | 图片大小 (bytes) |

- **响应体 (Response Body)**:

  ```json
  {
    "code": 200,
    "message": "图片入库成功",
    "data": {
      "id": 1,
      "url": "https://<project>.supabase.co/storage/v1/object/public/bucket/images/product-image-01.png",
      "createdAt": "2023-10-27T10:00:00Z"
    }
  }
  ```

### 4.2. 图片库管理

#### 4.2.1. 获取图片库列表

- **功能描述**: 分页获取图片库中的图片列表，默认按上传时间倒序排列。
- **接口路径**: `POST /image/list`
- **请求体 (Request Body)**:

  ```json
  {
    "page": 1,
    "pageSize": 20
  }
  ```

- **字段校验规则**:

| 字段名 (Field) | 类型 (Type) | 是否必填 (Required) | 校验规则/备注 (Validation/Note) |
| :--- | :--- | :--- | :--- |
| `page` | `number` | 是 | 页码，必须为正整数 |
| `pageSize` | `number` | 是 | 每页数量，建议范围 10-50 |

- **响应体 (Response Body)**:

  ```json
  {
    "code": 200,
    "message": "查询成功",
    "data": {
      "data": [
        {
          "id": 2,
          "url": "https://<project>.supabase.co/storage/v1/object/public/bucket/images/image-02.png",
          "name": "image-02.png",
          "createdAt": "2023-10-27T11:00:00Z"
        },
        {
          "id": 1,
          "url": "https://<project>.supabase.co/storage/v1/object/public/bucket/images/image-01.png",
          "name": "image-01.png",
          "createdAt": "2023-10-27T10:00:00Z"
        }
      ],
      "total": 100,
      "page": 1,
      "pageSize": 20,
      "totalPages": 5
    }
  }
  ```

### 4.3. 商品与图片关联管理

#### 4.3.1. 更新商品图片关联

- **功能描述**: 一个统一的接口，用于批量更新某个商品所关联的全部图片。通过提交完整的图片列表，实现新增、排序、移除和设置主图的功能。
- **接口路径**: `POST /product/updateImages`
- **请求体 (Request Body)**:

  ```json
  {
    "productId": 101,
    "images": [
      { "imageId": 3, "isMain": true },
      { "imageId": 5, "isMain": false },
      { "imageId": 2, "isMain": false }
    ]
  }
  ```

- **字段校验规则**:

| 字段名 (Field) | 类型 (Type) | 是否必填 (Required) | 校验规则/备注 (Validation/Note) |
| :--- | :--- | :--- | :--- |
| `productId` | `number` | 是 | 商品 ID |
| `images` | `array` | 是 | 图片对象数组。数组顺序即为图片显示顺序。 |
| `images[].imageId` | `number` | 是 | 图片 ID |
| `images[].isMain` | `boolean` | 是 | 是否为主图。整个数组中最多只能有一个为 `true`。 |

- **响应体 (Response Body)**:

  ```json
  {
    "code": 200,
    "message": "商品图片更新成功",
    "data": null
  }
  ```

- **后端业务逻辑**:
  1.  开启数据库事务。
  2.  根据 `productId` 删除 `PRODUCT_IMAGE` 表中所有旧的关联记录。
  3.  遍历请求体中的 `images` 数组。
  4.  对于数组中的每个图片对象，以其在数组中的索引作为 `sort_order`，连同 `productId`, `imageId`, `isMain` 一起，向 `PRODUCT_IMAGE` 表中插入一条新记录。
  5.  提交事务。
  6.  此方法通过“全量替换”的模式，简化了增、删、改、排序的逻辑。