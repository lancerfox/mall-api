/**
 * 数据库索引优化脚本
 * 为第二阶段新增的功能创建优化索引
 */

// 材料表索引优化
db.materials.createIndex({ name: 'text', description: 'text' }); // 全文搜索
db.materials.createIndex({ categoryId: 1, status: 1 });
db.materials.createIndex({ price: 1 });
db.materials.createIndex({ stock: 1 });
db.materials.createIndex({ color: 1 });
db.materials.createIndex({ hardness: 1 });
db.materials.createIndex({ density: 1 });
db.materials.createIndex({ createdAt: -1 });
db.materials.createIndex({ status: 1, createdAt: -1 });

// 复合索引用于高级搜索
db.materials.createIndex({ categoryId: 1, price: 1, status: 1 });
db.materials.createIndex({ hardness: 1, density: 1, status: 1 });
db.materials.createIndex({ price: 1, stock: 1, status: 1 });

// 图片表索引
db.material_images.createIndex({ materialId: 1, sortOrder: 1 });
db.material_images.createIndex({ materialId: 1, isMain: 1 });
db.material_images.createIndex({ status: 1, createdAt: -1 });
db.material_images.createIndex({ materialId: 1, status: 1, sortOrder: 1 });

// 搜索条件表索引
db.search_conditions.createIndex({ userId: 1, lastUsedAt: -1 });
db.search_conditions.createIndex({ userId: 1, name: 1 }, { unique: true });
db.search_conditions.createIndex({ userId: 1, isDefault: 1 });

// 操作日志表索引
db.operation_logs.createIndex({ userId: 1, createdAt: -1 });
db.operation_logs.createIndex({ targetType: 1, targetId: 1 });
db.operation_logs.createIndex({ operation: 1, createdAt: -1 });
db.operation_logs.createIndex({ targetType: 1, operation: 1, createdAt: -1 });

// TTL索引 - 自动清理30天前的操作日志
db.operation_logs.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000 },
); // 30天

print('索引优化完成！');
print('已创建的索引：');
print('- 材料表：全文搜索、字段索引、复合索引');
print('- 图片表：材料关联、排序、状态索引');
print('- 搜索条件表：用户关联、使用频率索引');
print('- 操作日志表：用户操作、目标对象、TTL索引');
