# 通用图片上传 API 文档

## 概述

通用图片上传模块提供了一套完整的图片管理功能，支持多种业务类型（材料、产品、用户、分类等）的图片上传、管理和操作。

## 基础信息

- **模块路径**: `src/modules/upload`
- **API 前缀**: `/api/v1/upload`
- **认证要求**: 所有接口都需要 JWT 认证

## 业务类型

支持以下业务类型：
- `material` - 材料
- `product` - 产品  
- `user` - 用户
- `category` - 分类

## API 接口列表

### 1. 上传单张图片

**接口地址**: `POST /api/v1/upload/image`

**请求格式**: `multipart/form-data`

**请求参数**:
```typescript
{
  businessId: string;      // 业务ID，必填
  businessType: string;    // 业务类型，必填，枚举值
  sortOrder?: number;      // 排序值，可选
  description?: string;    // 图片描述，可选
  alt?: string;           // Alt文本，可选
  file: File;             // 图片文件，必填
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "imageId": "IMG1640995200123abc",
    "businessId": "64b5f8e8f123456789abcdef",
    "businessType": "material",
    "fileName": "red_agate.jpg",
    "filePath": "/uploads/material/20240101/64b5f8e8f123456789abcdef/IMG1640995200123abc.jpg",
    "thumbnailPath": "/uploads/material/20240101/64b5f8e8f123456789abcdef/thumb_IMG1640995200123abc.jpg",
    "mediumPath": "/uploads/material/20240101/64b5f8e8f123456789abcdef/medium_IMG1640995200123abc.jpg",
    "fileSize": 1024000,
    "width": 800,
    "height": 600,
    "sortOrder": 1,
    "isMain": false,
    "description": "这是一张产品图片",
    "alt": "红色玛瑙石",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. 批量上传图片

**接口地址**: `POST /api/v1/upload/batch-images`

**请求格式**: `multipart/form-data`

**请求参数**:
```typescript
{
  businessId: string;      // 业务ID，必填
  businessType: string;    // 业务类型，必填
  files: File[];          // 图片文件数组，最多10个
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "批量上传完成",
  "data": {
    "successCount": 3,
    "failedCount": 1,
    "successList": [
      {
        "imageId": "IMG1640995200123abc",
        "fileName": "image1.jpg",
        "filePath": "/uploads/material/20240101/64b5f8e8f123456789abcdef/IMG1640995200123abc.jpg"
      }
    ],
    "failedList": [
      {
        "fileName": "invalid_file.txt",
        "error": "不支持的文件格式"
      }
    ]
  }
}
```

### 3. 删除图片

**接口地址**: `POST /api/v1/upload/delete-image`

**请求参数**:
```json
{
  "imageId": "IMG1640995200123abc"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 4. 获取图片列表

**接口地址**: `GET /api/v1/upload/image-list`

**请求参数**:
```typescript
{
  businessId: string;      // 业务ID
  businessType: string;    // 业务类型
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "imageId": "IMG1640995200123abc",
      "businessId": "64b5f8e8f123456789abcdef",
      "businessType": "material",
      "fileName": "red_agate.jpg",
      "filePath": "/uploads/material/20240101/64b5f8e8f123456789abcdef/IMG1640995200123abc.jpg",
      "thumbnailPath": "/uploads/material/20240101/64b5f8e8f123456789abcdef/thumb_IMG1640995200123abc.jpg",
      "mediumPath": "/uploads/material/20240101/64b5f8e8f123456789abcdef/medium_IMG1640995200123abc.jpg",
      "fileSize": 1024000,
      "width": 800,
      "height": 600,
      "sortOrder": 1,
      "isMain": false,
      "description": "这是一张产品图片",
      "alt": "红色玛瑙石",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 5. 设置主图

**接口地址**: `POST /api/v1/upload/set-main-image`

**请求参数**:
```json
{
  "imageId": "IMG1640995200123abc"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "设置成功",
  "data": null
}
```

### 6. 调整图片排序

**接口地址**: `POST /api/v1/upload/sort-images`

**请求参数**:
```json
{
  "businessId": "64b5f8e8f123456789abcdef",
  "businessType": "material",
  "imageIds": ["IMG001", "IMG002", "IMG003"]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "排序成功",
  "data": null
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 8500 | 上传失败 |
| 8501 | 请选择要上传的文件 |
| 8502 | 不支持的文件格式 |
| 8503 | 文件大小超过限制 |
| 8504 | 文件数量超过限制 |
| 8505 | 图片不存在 |

## 文件限制

- **支持格式**: JPG、PNG、WEBP
- **文件大小**: 单个文件最大 5MB
- **批量上传**: 一次最多 10 个文件

## 图片处理

系统会自动为每张上传的图片生成：
1. **原图**: 压缩质量 90%
2. **缩略图**: 150x150 像素，压缩质量 80%
3. **中等尺寸图**: 500x500 像素（等比缩放），压缩质量 85%

## 存储结构

```
uploads/
├── material/          # 材料图片
│   └── 20240101/      # 按日期分组
│       └── businessId/
│           ├── IMG001.jpg       # 原图
│           ├── thumb_IMG001.jpg # 缩略图
│           └── medium_IMG001.jpg # 中等尺寸
├── product/           # 产品图片
├── user/              # 用户头像
└── category/          # 分类图片
```