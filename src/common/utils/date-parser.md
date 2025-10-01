# 日期解析工具使用说明

## 概述

本工具提供统一的日期字符串解析功能，支持两种日期格式：
1. 仅日期格式：`YYYY-MM-DD` (例如: `2025-10-01`)
2. 包含时间格式：`YYYY-MM-DD HH:mm:ss` (例如: `2025-10-01 12:30:45`)

## 功能函数

### parseDateString(dateString: string): Date | null

解析日期字符串，返回Date对象或null（如果解析失败）。

**参数：**
- `dateString`: 日期字符串，支持上述两种格式

**返回值：**
- 成功时返回Date对象
- 失败时返回null

**使用示例：**
```typescript
import { parseDateString } from './date-parser';

// 解析仅日期格式
const date1 = parseDateString('2025-10-01');
// 结果: Date对象，表示2025-10-01 00:00:00

// 解析包含时间格式
const date2 = parseDateString('2025-10-01 12:30:45');
// 结果: Date对象，表示2025-10-01 12:30:45

// 解析无效格式
const date3 = parseDateString('invalid-date');
// 结果: null
```

### transformDateString(options: { value: unknown }): Date | null

用于class-transformer的转换函数，可直接在DTO中使用。

**参数：**
- `options`: 包含value属性的对象

**返回值：**
- 成功时返回Date对象
- 失败时返回null

**使用示例：**
```typescript
import { Transform } from 'class-transformer';
import { transformDateString } from './date-parser';

export class ExampleDto {
  @Transform(transformDateString)
  startDate: Date;
}
```

## 在DTO中使用

在需要处理日期字符串的DTO中，推荐使用`transformDateString`函数：

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformDateString } from '../utils/date-parser';

export class SearchDto {
  @ApiPropertyOptional({
    description: '开始时间',
    example: '2025-10-01 00:00:00',
  })
  @Transform(transformDateString)
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({
    description: '结束时间',
    example: '2025-10-01 23:59:59',
  })
  @Transform(transformDateString)
  @IsOptional()
  @IsDateString()
  endTime?: string;
}
```

## 在服务中使用

在服务层中处理日期时，可以使用`parseDateString`函数：

```typescript
import { parseDateString } from '../utils/date-parser';

// 在服务方法中
const startDate = parseDateString(query.startTime);
const endDate = parseDateString(query.endTime);

if (startDate && endDate) {
  // 使用解析后的日期进行查询
  queryBuilder.andWhere('entity.createdAt BETWEEN :startDate AND :endDate', {
    startDate,
    endDate,
  });
}
```

## 注意事项

1. 该工具会自动将仅日期格式（如`2025-10-01`）转换为完整的时间格式（`2025-10-01 00:00:00`）
2. 对于无效的日期格式，函数会返回null，使用时需要进行空值检查
3. 推荐在所有需要处理日期字符串的地方使用此工具，以保持项目中日期处理的一致性