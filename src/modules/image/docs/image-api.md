# 图片管理模块 API 文档

## 概述

图片管理模块提供了完整的图片上传、存储、管理和商品关联功能。基于 Supabase 对象存储服务，实现客户端直传模式，提高上传效率并减轻服务器负担。

## 接口列表

### 1. 获取图片上传凭证

**接口路径**: `POST /image/getUploadToken`

**功能描述**: 前端在上传图片前，调用此接口获取一个有时效性的、预签名的 Supabase 上传 URL。

**请求参数**:
```json
{
  "businessModule": "product",
  "fileType": "image/png"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| businessModule | string | 否 | 业务模块名称，用于文件夹分类（如：product, user, article），默认为"default" |
| fileType | string | 是 | 图片MIME类型，支持 image/jpeg, image/png, image/gif |

**响应示例**:
```json
{
  "code": 200,
  "message": "获取上传凭证成功",
  "data": {
    "signedUrl": "https://example.supabase.co/storage/v1/object/upload/bucket/product/2025-09-27/1698393600_abc123.png?token=...",
    "path": "product/2025-09-27/1698393600_abc123.png"
  }
}
```

**错误码**:
- `7002`: 图片格式不支持
- `7004`: Supabase存储服务错误

---

### 2. 创建图片记录

**接口路径**: `POST /image/create`

**功能描述**: 前端成功将图片直传到 Supabase 后，调用此接口将图片信息保存到数据库。

**请求参数**:
```json
{
  "url": "https://example.supabase.co/storage/v1/object/public/bucket/images/product-image-01.png",
  "path": "images/product-image-01.png",
  "name": "product-image-01.png",
  "size": 102400,
  "mimeType": "image/png"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| url | string | 是 | 图片公网URL |
| path | string | 是 | 图片在Supabase中的路径 |
| name | string | 是 | 图片文件名 |
| size | number | 否 | 图片大小（字节） |
| mimeType | string | 否 | 图片MIME类型 |

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "url": "https://example.supabase.co/storage/v1/object/public/bucket/images/product-image-01.png",
    "createdAt": "2023-10-27T10:00:00Z"
  }
}
```

**错误码**:
- `7001`: 图片上传失败

---

### 3. 获取图片库列表

**接口路径**: `POST /image/list`

**功能描述**: 分页获取图片库中的图片列表，默认按上传时间倒序排列。

**请求参数**:
```json
{
  "page": 1,
  "pageSize": 20
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 是 | 页码，从1开始 |
| pageSize | number | 是 | 每页数量，建议范围10-50 |

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "items": [
      {
        "id": 2,
        "url": "https://example.supabase.co/storage/v1/object/public/bucket/images/image-02.png",
        "name": "image-02.png",
        "size": 204800,
        "createdAt": "2023-10-27T11:00:00Z"
      },
      {
        "id": 1,
        "url": "https://example.supabase.co/storage/v1/object/public/bucket/images/image-01.png",
        "name": "image-01.png",
        "size": 102400,
        "createdAt": "2023-10-27T10:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

### 4. 更新商品图片关联

**接口路径**: `POST /product/updateImages`

**功能描述**: 批量更新某个商品所关联的全部图片，支持新增、排序、移除和设置主图功能。

**请求参数**:
```json
{
  "productId": "101",
  "images": [
    { "imageId": 3, "isMain": true },
    { "imageId": 5, "isMain": false },
    { "imageId": 2, "isMain": false }
  ]
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| productId | string | 是 | 商品ID |
| images | array | 是 | 图片对象数组，数组顺序即为显示顺序 |
| images[].imageId | number | 是 | 图片ID |
| images[].isMain | boolean | 是 | 是否为主图，整个数组中最多只能有一个为true |

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

**业务规则**:
- 使用"全量替换"模式，会删除商品的所有旧图片关联，然后创建新的关联
- 数组中图片的顺序决定了在前端的显示顺序
- 最多只能设置一张主图
- 如果传入空数组，则会清空该商品的所有图片关联

**错误码**:
- `9007`: 数据验证失败（如设置多张主图）

---

## 上传流程说明

### 完整的图片上传流程

1. **前端请求上传凭证**
   ```javascript
   // 1. 获取上传凭证
   const tokenResponse = await fetch('/image/getUploadToken', {
     method: 'POST',
     body: JSON.stringify({
       businessModule: 'product',
       fileType: 'image/png'
     })
   });
   const { signedUrl, path } = tokenResponse.data;
   ```

2. **直传到Supabase**
   ```javascript
   // 2. 使用预签名URL直传文件
   const uploadResponse = await fetch(signedUrl, {
     method: 'PUT',
     body: fileBlob
   });
   ```

3. **保存图片记录**
   ```javascript
   // 3. 上传成功后，保存图片信息到数据库
   const publicUrl = `https://example.supabase.co/storage/v1/object/public/bucket/${path}`;
   const createResponse = await fetch('/image/create', {
     method: 'POST',
     body: JSON.stringify({
       url: publicUrl,
       path: path,
       name: 'product-image.png',
       size: fileBlob.size,
       mimeType: 'image/png'
     })
   });
   ```

4. **关联到商品**
   ```javascript
   // 4. 将图片关联到商品
   await fetch('/product/updateImages', {
     method: 'POST',
     body: JSON.stringify({
       productId: '101',
       images: [
         { imageId: createResponse.data.id, isMain: true }
       ]
     })
   });
   ```

### 错误处理

- 上传凭证获取失败：检查文件类型和大小限制
- 直传失败：检查网络连接和凭证有效期
- 图片记录创建失败：检查URL格式和数据库连接
- 商品关联失败：检查商品ID和图片ID的有效性

## 注意事项

1. **文件类型限制**: 仅支持 JPEG、PNG、GIF 格式
2. **文件大小限制**: 建议不超过 5MB
3. **凭证有效期**: 预签名URL有效期为60秒
4. **并发上传**: 支持多文件并发上传
5. **事务处理**: 商品图片关联更新使用数据库事务确保数据一致性