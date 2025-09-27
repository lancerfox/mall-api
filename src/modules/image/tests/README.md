# 图片管理模块测试说明

## 测试结构

图片管理模块包含以下测试文件：

1. `image.controller.spec.ts` - 控制器层测试
2. `image.service.spec.ts` - 服务层测试
3. `supabase.service.spec.ts` - Supabase服务测试

## 测试配置

测试使用了项目中的[.env.test](file:///Users/peng/myproject/energyStone_back_end-s/mall-api/.env.test)配置文件中的Supabase配置：

- SUPABASE_URL: http://47.115.232.131
- SUPABASE_SERVICE_KEY: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwicmVmIjoic2JwLWtzcnBwYWRyOXZveWlrNzMiLCJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1ODg2ODAyOCwiZXhwIjoyMDc0NDQ0MDI4fQ.4zqW5ksm4GGsc2wQnNWQGf0g--K71lJzWhqk0YxTPa0
- SUPABASE_BUCKET_NAME: mall-test

这些配置确保了测试环境与实际测试环境的一致性。

## 测试覆盖率

目前测试覆盖了图片管理模块的所有业务逻辑：

- 控制器层: 8个测试用例
- 服务层: 11个测试用例
- Supabase服务层: 12个测试用例

总计: 31个测试用例

## 运行测试

```bash
# 运行图片模块的所有测试
npm run test -- src/modules/image

# 运行特定测试文件
npm run test -- src/modules/image/tests/image.controller.spec.ts
npm run test -- src/modules/image/tests/image.service.spec.ts
npm run test -- src/modules/image/tests/supabase.service.spec.ts

# 生成测试覆盖率报告
npm run test:cov -- src/modules/image
```

## 测试内容

### ImageController测试
- 获取图片上传凭证
- 创建图片记录
- 获取图片列表
- 删除图片
- 检查Supabase连接状态

### ImageService测试
- 生成上传凭证的各种场景（成功、文件类型不支持、Supabase错误等）
- 创建图片记录（包括URL生成）
- 获取图片列表
- 删除图片（包括图片不存在、Supabase删除失败等情况）
- 检查Supabase连接状态

### SupabaseService测试
- 创建预签名上传URL
- 获取文件公网URL
- 删除文件
- 检查存储桶是否存在

所有测试都包含了正常情况和异常情况的验证，确保代码的健壮性。