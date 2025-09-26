# 项目测试说明

## 测试结构

本项目为每个业务模块的控制器都编写了单元测试，测试文件位于各模块的 `tests` 目录下：

- `src/modules/auth/tests/auth.controller.spec.ts` - 认证模块测试
- `src/modules/menu/tests/menu.controller.spec.ts` - 菜单模块测试
- `src/modules/permission/tests/permission.controller.spec.ts` - 权限模块测试
- `src/modules/product/tests/product.controller.spec.ts` - 商品模块测试
- `src/modules/product/tests/product-category.controller.spec.ts` - 商品分类模块测试
- `src/modules/role/tests/role.controller.spec.ts` - 角色模块测试
- `src/modules/user/tests/user.controller.spec.ts` - 用户模块测试

## 运行测试

### 运行所有测试

```bash
npm test
```

### 运行测试并查看覆盖率

```bash
npm test -- --coverage
```

### 运行特定模块的测试

```bash
npm test -- src/modules/user/tests/user.controller.spec.ts
```

## 测试特点

1. **中文断言**：所有测试用例的断言都使用中文描述，便于理解和维护。
2. **完整覆盖**：每个控制器的所有接口方法都有对应的测试用例。
3. **边界测试**：包括正常情况、异常情况和边界条件的测试。
4. **Mock依赖**：使用 Jest 的 mock 功能模拟服务依赖，确保测试的独立性。

## 测试示例

每个测试文件都遵循以下结构：

```typescript
describe('ControllerName', () => {
  let controller: ControllerName;
  let service: jest.Mocked<ServiceName>;

  beforeEach(async () => {
    // 测试模块设置
  });

  describe('methodName', () => {
    it('应该在某种条件下返回期望结果', async () => {
      // 安排 (Arrange)
      // 执行 (Act)
      // 断言 (Assert)
    });
  });
});
```