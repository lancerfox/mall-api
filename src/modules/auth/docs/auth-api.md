# 认证模块接口文档

## 概述

认证模块提供用户登录、权限验证、密码管理等核心认证功能。所有接口都遵循RESTful设计原则。

## 基础信息

- **基础路径**: `/api/auth`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`

## 接口列表

### 1. 用户登录

**接口说明**: 用户通过用户名和密码进行登录，获取访问令牌

**请求方式**: `POST`

**接口路径**: `/api/auth/login`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| username | string | 是 | 用户名，3-20位字符 | "admin" |
| password | string | 是 | 密码，1-50位字符 | "Password123!" |

**请求示例**:
```json
{
  "username": "admin",
  "password": "Password123!"
}
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| access_token | string | JWT访问令牌 | "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." |
| user | object | 用户信息对象 | - |
| user.id | string | 用户ID | "507f1f77bcf86cd799439011" |
| user.username | string | 用户名 | "admin" |
| user.roles | array | 用户角色列表 | - |
| user.status | string | 用户状态 | "active" |
| user.avatar | string | 头像URL | "https://example.com/avatar.jpg" |
| user.permissions | array | 权限列表 | ["user:read", "user:write"] |
| user.lastLoginTime | string | 最后登录时间 | "2024-01-01T00:00:00.000Z" |
| user.lastLoginIp | string | 最后登录IP | "192.168.1.1" |
| expires_in | number | 令牌过期时间(秒) | 3600 |

**响应示例**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "roles": [
      {
        "id": "role-id-1",
        "name": "管理员"
      }
    ],
    "status": "active",
    "avatar": "https://example.com/avatar.jpg",
    "permissions": ["user:read", "user:write", "menu:read"],
    "lastLoginTime": "2024-01-01T00:00:00.000Z",
    "lastLoginIp": "192.168.1.1"
  },
  "expires_in": 3600
}
```

**错误码**:
- `401`: 用户名或密码错误
- `500`: 服务器内部错误

---

### 2. 获取用户资料

**接口说明**: 获取当前登录用户的详细信息

**请求方式**: `GET`

**接口路径**: `/api/auth/profile`

**认证要求**: 需要JWT Token

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | string | 用户ID | "507f1f77bcf86cd799439011" |
| username | string | 用户名 | "admin" |
| roles | array | 用户角色列表 | - |
| status | string | 用户状态 | "active" |
| avatar | string | 头像URL | "https://example.com/avatar.jpg" |
| permissions | array | 权限列表 | ["user:read", "user:write"] |
| lastLoginTime | string | 最后登录时间 | "2024-01-01T00:00:00.000Z" |
| lastLoginIp | string | 最后登录IP | "192.168.1.1" |

**响应示例**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "admin",
  "roles": [
    {
      "id": "role-id-1",
      "name": "管理员"
    }
  ],
  "status": "active",
  "avatar": "https://example.com/avatar.jpg",
  "permissions": ["user:read", "user:write", "menu:read"],
  "lastLoginTime": "2024-01-01T00:00:00.000Z",
  "lastLoginIp": "192.168.1.1"
}
```

**错误码**:
- `401`: 未授权访问

---

### 3. 修改密码

**接口说明**: 修改当前用户的登录密码

**请求方式**: `POST`

**接口路径**: `/api/auth/password`

**认证要求**: 需要JWT Token

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|--------|------|------|------|----------|------|
| currentPassword | string | 是 | 当前密码 | 最大50位字符 | "currentPassword123" |
| newPassword | string | 是 | 新密码 | 8-32位字符，必须包含大小写字母、数字和特殊字符 | "NewPassword123!" |
| confirmPassword | string | 是 | 确认新密码 | 最大50位字符 | "NewPassword123!" |

**请求示例**:
```json
{
  "currentPassword": "currentPassword123",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| message | string | 操作结果消息 | "密码修改成功" |

**响应示例**:
```json
{
  "message": "密码修改成功"
}
```

**错误码**:
- `400`: 新密码和确认密码不一致
- `401`: 当前密码不正确或未授权访问

---

### 4. 重置密码

**接口说明**: 管理员重置指定用户的密码

**请求方式**: `POST`

**接口路径**: `/api/auth/reset-password`

**认证要求**: 需要JWT Token

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| username | string | 是 | 要重置密码的用户名 | "admin" |

**请求示例**:
```json
{
  "username": "admin"
}
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| message | string | 操作结果消息 | "密码重置成功" |
| newPassword | string | 新生成的密码 | "TempPassword123!" |

**响应示例**:
```json
{
  "message": "密码重置成功",
  "newPassword": "TempPassword123!"
}
```

**错误码**:
- `400`: 请求参数错误或用户状态异常
- `401`: 未授权访问

---

### 5. 获取安全统计信息

**接口说明**: 获取用户的安全相关统计信息

**请求方式**: `GET`

**接口路径**: `/api/auth/security-stats`

**认证要求**: 需要JWT Token

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| totalAttempts | number | 总登录尝试次数 | 150 |
| successfulAttempts | number | 成功登录次数 | 120 |
| failedAttempts | number | 失败登录次数 | 30 |
| lockedAccounts | number | 被锁定的账户数量 | 2 |

**响应示例**:
```json
{
  "totalAttempts": 150,
  "successfulAttempts": 120,
  "failedAttempts": 30,
  "lockedAccounts": 2
}
```

**错误码**:
- `401`: 未授权访问

---

## 数据模型

### LoginDto - 登录请求数据模型
```typescript
{
  username: string;    // 用户名，3-20位字符
  password: string;    // 密码，1-50位字符
}
```

### ChangePasswordDto - 修改密码请求数据模型
```typescript
{
  currentPassword: string;    // 当前密码，最大50位
  newPassword: string;        // 新密码，8-32位，包含大小写字母、数字和特殊字符
  confirmPassword: string;    // 确认密码，最大50位
}
```

### ResetPasswordDto - 重置密码请求数据模型
```typescript
{
  username: string;    // 用户名
}
```

### AuthResponseDto - 认证响应数据模型
```typescript
{
  access_token: string;    // JWT访问令牌
  user: UserInfoDto;       // 用户信息
  expires_in: number;      // 令牌过期时间(秒)
}
```

### UserInfoDto - 用户信息数据模型
```typescript
{
  id: string;              // 用户ID
  username: string;        // 用户名
  roles: RoleResponseDto[]; // 角色列表
  status: string;          // 用户状态
  avatar?: string;         // 头像URL
  permissions: string[];   // 权限列表
  lastLoginTime?: Date;    // 最后登录时间
  lastLoginIp?: string;    // 最后登录IP
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

1. **密码强度**: 新密码必须满足以下要求：
   - 长度8-32个字符
   - 包含至少一个小写字母
   - 包含至少一个大写字母  
   - 包含至少一个数字
   - 包含至少一个特殊字符 (@$!%*?&)

2. **令牌管理**: 
   - JWT令牌有效期为1小时
   - 令牌需要妥善保管，防止泄露
   - 敏感操作需要重新验证身份

3. **访问控制**:
   - 除登录接口外，其他接口都需要认证
   - 部分接口需要特定的权限才能访问

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2024-01-01 | 初始版本发布 |