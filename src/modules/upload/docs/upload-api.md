# 上传模块接口文档

## 概述

上传模块提供文件上传功能，支持图片、视频等多种文件类型。所有接口都遵循RESTful设计原则。

## 基础信息

- **基础路径**: `/api/upload`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `multipart/form-data` (文件上传)

## 接口列表

### 1. 上传图片

**接口说明**: 上传单张图片文件

**请求方式**: `POST`

**接口路径**: `/api/v1/upload/image`

**认证要求**: 需要JWT Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| file | file | 是 | 要上传的图片文件 | (二进制文件) |

**请求示例**:
```
POST /api/v1/upload/image
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="example.jpg"
Content-Type: image/jpeg

(binary data of example.jpg)
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| url | string | 上传成功后的文件URL | "https://example.com/uploads/image.jpg" |
| filename | string | 文件名 | "image.jpg" |
| size | number | 文件大小 (字节) | 102400 |
| mimetype | string | 文件MIME类型 | "image/jpeg" |

**响应示例**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://example.com/uploads/image.jpg",
    "filename": "image.jpg",
    "size": 102400,
    "mimetype": "image/jpeg"
  }
}
```

**错误码**:
- `400`: 请求参数错误 (例如，未选择文件或文件类型不支持)
- `401`: 未授权访问
- `500`: 服务器内部错误

---

## 数据模型

### UploadImageResponseDto - 上传图片响应数据模型
```typescript
{
  url: string;       // 上传成功后的文件URL
  filename: string;  // 文件名
  size: number;      // 文件大小 (字节)
  mimetype: string;  // 文件MIME类型
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
- `500`: 服务器内部错误

## 安全要求

1. **认证**: 所有上传接口都需要有效的JWT Token进行认证。
2. **文件类型验证**: 严格限制允许上传的文件类型，防止恶意文件上传。
3. **文件大小限制**: 限制单个文件的大小，防止资源滥用。
4. **存储路径安全**: 上传文件应存储在非Web可直接访问的目录，通过代理或CDN提供访问。
5. **病毒扫描**: (可选) 对上传文件进行病毒扫描。

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2024-01-01 | 初始版本发布 |