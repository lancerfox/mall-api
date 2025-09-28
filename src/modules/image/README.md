# 图片管理模块

## 概述

图片管理模块提供了完整的图片上传、存储、管理和商品关联功能。基于 Supabase 对象存储服务，实现客户端直传模式，提高上传效率并减轻服务器负担。

## ✅ 功能特性

- **图片上传与入库**: 支持获取Supabase预签名URL和图片记录创建
- **图片库管理**: 提供分页查询的图片列表接口
- **商品图片关联**: 支持批量更新、排序和主图设置
- **Supabase集成**: 客户端直传模式，减轻服务器负担
- **完整的API文档**: 详细的接口说明和使用示例
- **类型安全**: 完整的TypeScript类型定义
- **参数验证**: 使用class-validator进行严格的参数校验
- **健康检查**: 提供Supabase连接状态检查
- **错误处理**: 完善的错误码和异常处理机制

## 🚀 快速开始

### 1. 配置 Supabase

在 `.env` 文件中配置：

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_BUCKET_NAME=mall-dev
```

### 2. 测试连接

```bash
npm run test:supabase
```

### 3. 启动应用

```bash
npm run start:dev
```

### 4. 测试API

```bash
# 健康检查
curl -X POST http://localhost:3000/image/health

# 获取上传凭证
curl -X POST http://localhost:3000/image/getUploadToken \
  -H "Content-Type: application/json" \
  -d '{"businessModule": "product", "fileType": "image/png"}'
```

## 📊 数据模型

### Image 实体
```typescript
{
  id: number;           // 图片ID
  url: string;          // 图片公网URL
  path: string;         // Supabase中的路径
  name: string;         // 文件名
  size?: number;        // 文件大小(bytes)
  mimeType?: string;    // MIME类型
  createdAt: Date;      // 创建时间
  updatedAt: Date;      // 更新时间
}
```

### ProductImage 关联实体
```typescript
{
  productId: string;    // 商品ID
  imageId: number;      // 图片ID
  sortOrder: number;    // 显示顺序
  isMain: boolean;      // 是否为主图
  createdAt: Date;      // 创建时间
  updatedAt: Date;      // 更新时间
}
```

## 🔌 API 接口

### 1. 获取上传凭证
- **路径**: `POST /image/getUploadToken`
- **功能**: 获取Supabase预签名上传URL
- **支持格式**: JPEG, PNG, GIF
- **文件大小**: 最大5MB

### 2. 创建图片记录
- **路径**: `POST /image/create`
- **功能**: 将上传成功的图片信息保存到数据库

### 3. 获取图片列表
- **路径**: `POST /image/list`
- **功能**: 分页获取图片库列表
- **排序**: 按创建时间倒序

### 4. 更新商品图片
- **路径**: `POST /product/updateImages`
- **功能**: 批量更新商品图片关联
- **特性**: 支持排序、主图设置、全量替换

### 5. 删除图片
- **路径**: `POST /image/delete`
- **功能**: 删除图片记录和Supabase文件

### 6. 健康检查
- **路径**: `POST /image/health`
- **功能**: 检查Supabase连接状态

## 💻 前端集成示例

### React + TypeScript 示例

```typescript
interface UploadResponse {
  code: number;
  message: string;
  data: {
    token: string;
    path: string;
  } | null;
}

interface CreateImageResponse {
  code: number;
  message: string;
  data: {
    id: number;
    url: string;
    createdAt: string;
  } | null;
}

class ImageUploadService {
  private baseUrl = 'http://localhost:3000';

  // 1. 获取上传凭证
  async getUploadToken(file: File): Promise<UploadResponse> {
    const response = await fetch(`${this.baseUrl}/image/getUploadToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessModule: 'product',
        fileType: file.type
      })
    });
    return response.json();
  }

  // 2. 直传到Supabase
  async uploadToSupabase(file: File, token: string): Promise<boolean> {
    const response = await fetch(token, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });
    return response.ok;
  }

  // 3. 保存图片记录
  async createImageRecord(file: File, path: string): Promise<CreateImageResponse> {
    const response = await fetch(`${this.baseUrl}/image/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: path,
        name: file.name,
        size: file.size,
        mimeType: file.type
      })
    });
    return response.json();
  }

  // 4. 完整上传流程
  async uploadImage(file: File): Promise<CreateImageResponse> {
    try {
      // 验证文件
      if (!this.validateFile(file)) {
        throw new Error('文件格式或大小不符合要求');
      }

      // 获取上传凭证
      const tokenResult = await this.getUploadToken(file);
      if (tokenResult.code !== 200 || !tokenResult.data) {
        throw new Error(tokenResult.message);
      }

      // 直传到Supabase
      const uploadSuccess = await this.uploadToSupabase(file, tokenResult.data.token);
      if (!uploadSuccess) {
        throw new Error('文件上传失败');
      }

      // 保存图片记录
      const createResult = await this.createImageRecord(file, tokenResult.data.path);
      if (createResult.code !== 200) {
        throw new Error(createResult.message);
      }

      return createResult;
    } catch (error) {
      console.error('图片上传失败:', error);
      throw error;
    }
  }

  // 文件验证
  private validateFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      alert('仅支持 JPEG、PNG、GIF 格式的图片');
      return false;
    }

    if (file.size > maxSize) {
      alert('图片大小不能超过 5MB');
      return false;
    }

    return true;
  }
}

// React 组件示例
const ImageUploader: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const uploadService = new ImageUploadService();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(file => 
        uploadService.uploadImage(file)
      );
      
      const results = await Promise.all(uploadPromises);
      const successResults = results.filter(result => result.code === 200);
      
      setUploadedImages(prev => [...prev, ...successResults.map(r => r.data)]);
      alert(`成功上传 ${successResults.length} 张图片`);
    } catch (error) {
      alert('上传失败: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/gif"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      {uploading && <p>上传中...</p>}
      
      <div className="image-grid">
        {uploadedImages.map(image => (
          <img
            key={image.id}
            src={image.url}
            alt="上传的图片"
            style={{ width: 200, height: 200, objectFit: 'cover' }}
          />
        ))}
      </div>
    </div>
  );
};
```

### Vue 3 + TypeScript 示例

```vue
<template>
  <div>
    <input
      type="file"
      multiple
      accept="image/*"
      @change="handleFileSelect"
      :disabled="uploading"
    />
    <div v-if="uploading">上传中...</div>
    
    <div class="image-grid">
      <img
        v-for="image in uploadedImages"
        :key="image.id"
        :src="image.url"
        alt="上传的图片"
        class="uploaded-image"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const uploading = ref(false);
const uploadedImages = ref<any[]>([]);

const uploadImage = async (file: File) => {
  // 实现与React示例相同的上传逻辑
  // ...
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files) return;

  uploading.value = true;
  
  try {
    const results = await Promise.all(
      Array.from(files).map(uploadImage)
    );
    uploadedImages.value.push(...results);
  } catch (error) {
    console.error('上传失败:', error);
  } finally {
    uploading.value = false;
  }
};
</script>

<style scoped>
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.uploaded-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}
</style>
```

## 🔧 配置说明

### 环境变量

```env
# Supabase 配置
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_BUCKET_NAME=mall-dev

# 可选配置
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_MIME_TYPES=image/jpeg,image/jpg,image/png,image/gif
```

### Supabase 存储桶设置

1. 创建公开存储桶
2. 设置适当的 RLS 策略
3. 配置 CORS 允许跨域上传

详细配置请参考：[Supabase 配置指南](../../docs/supabase-setup.md)

## 🧪 测试

### 单元测试

```bash
npm run test -- image.controller.spec.ts
```

### 集成测试

```bash
npm run test:supabase
```

### API 测试

使用 Postman 或 curl 测试各个接口：

```bash
# 测试健康检查
curl -X POST http://localhost:3000/image/health

# 测试获取上传凭证
curl -X POST http://localhost:3000/image/getUploadToken \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test.png", "fileType": "image/png"}'
```

## 📈 性能优化

1. **并发上传**: 支持多文件并发上传
2. **CDN 加速**: 利用 Supabase CDN 提高访问速度
3. **缓存策略**: 图片列表接口支持缓存
4. **压缩优化**: 建议前端进行图片压缩后上传

## 🔒 安全考虑

1. **文件类型验证**: 严格限制允许的文件类型
2. **文件大小限制**: 防止大文件攻击
3. **预签名URL时效**: 限制上传凭证的有效期
4. **权限控制**: 基于用户角色的访问控制

## 📚 相关文档

- [API 详细文档](./docs/image-api.md)
- [Supabase 配置指南](../../docs/supabase-setup.md)
- [错误码说明](../../../common/constants/error-codes.ts)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个模块！

## 📄 许可证

本项目采用 MIT 许可证。