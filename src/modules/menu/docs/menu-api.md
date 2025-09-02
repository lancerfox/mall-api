# 菜单管理 API 文档

## 概述

菜单管理模块提供系统菜单的CRUD操作和权限管理功能，支持树形结构菜单管理。

## 基础信息

- **基础路径**: `/menus`
- **API版本**: v1
- **认证方式**: Bearer Token

## 接口列表

### 1. 获取菜单列表

**GET** `/menus`

获取所有菜单列表（树形结构）

**响应示例**:
```json
{
  "data": [
    {
      "id": "60d21b4667d0d8992e610c85",
      "parentId": null,
      "path": "/system",
      "name": "System",
      "component": "views/System/index",
      "redirect": "/system/user",
      "meta": {
        "title": "系统管理",
        "icon": "carbon:settings",
        "hidden": false,
        "alwaysShow": false
      },
      "sortOrder": 1,
      "status": "active",
      "createdAt": "2023-06-24T10:30:00.000Z",
      "updatedAt": "2023-06-24T10:30:00.000Z",
      "children": [...]
    }
  ]
}
```

### 2. 根据角色获取菜单

**POST** `/menus/by-role`

根据角色ID获取对应的菜单权限

**请求参数**:
```json
{
  "roleId": "60d21b4667d0d8992e610c86"
}
```

**响应**: 同获取菜单列表

### 3. 获取菜单详情

**POST** `/menus/detail`

获取单个菜单的详细信息

**请求参数**:
```json
{
  "id": "60d21b4667d0d8992e610c85"
}
```

**响应示例**:
```json
{
  "data": {
    "id": "60d21b4667d0d8992e610c85",
    "parentId": null,
    "path": "/system",
    "name": "System",
    "component": "views/System/index",
    "redirect": "/system/user",
    "meta": {
      "title": "系统管理",
      "icon": "carbon:settings",
      "hidden": false,
      "alwaysShow": false
    },
    "sortOrder": 1,
    "status": "active",
    "createdAt": "2023-06-24T10:30:00.000Z",
    "updatedAt": "2023-06-24T10:30:00.000Z"
  }
}
```

### 4. 创建菜单

**POST** `/menus/create`

创建新的菜单项

**请求参数**:
```json
{
  "parentId": "60d21b4667d0d8992e610c85",
  "path": "/system/user",
  "name": "UserManagement",
  "component": "views/System/User/index",
  "redirect": null,
  "metaTitle": "用户管理",
  "metaIcon": "carbon:user",
  "metaHidden": false,
  "metaAlwaysShow": false,
  "sortOrder": 1
}
```

**响应**: 同菜单详情

### 5. 更新菜单

**POST** `/menus/update`

更新菜单信息

**请求参数**:
```json
{
  "id": "60d21b4667d0d8992e610c85",
  "path": "/system",
  "name": "SystemManagement",
  "status": "active"
}
```

**响应**: 同菜单详情

### 6. 删除菜单

**POST** `/menus/delete`

删除菜单项

**请求参数**:
```json
{
  "id": "60d21b4667d0d8992e610c85"
}
```

**响应**:
```json
{
  "message": "删除成功"
}
```

## 数据结构

### MenuResponseDto
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| id | string | 是 | 菜单ID |
| parentId | string | 否 | 父级菜单ID |
| path | string | 是 | 菜单路径 |
| name | string | 是 | 菜单名称 |
| component | string | 否 | 组件路径 |
| redirect | string | 否 | 重定向路径 |
| meta | object | 是 | 菜单元数据 |
| meta.title | string | 否 | 菜单标题 |
| meta.icon | string | 否 | 菜单图标 |
| meta.hidden | boolean | 否 | 是否隐藏 |
| meta.alwaysShow | boolean | 否 | 是否始终显示 |
| sortOrder | number | 是 | 排序顺序 |
| status | string | 是 | 状态：active/inactive |
| createdAt | string | 是 | 创建时间 |
| updatedAt | string | 是 | 更新时间 |
| children | MenuResponseDto[] | 否 | 子菜单 |

### CreateMenuDto
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| parentId | string | 否 | 父级菜单ID |
| path | string | 是 | 菜单路径 |
| name | string | 是 | 菜单名称 |
| component | string | 否 | 组件路径 |
| redirect | string | 否 | 重定向路径 |
| metaTitle | string | 否 | 菜单标题 |
| metaIcon | string | 否 | 菜单图标 |
| metaHidden | boolean | 否 | 是否隐藏 |
| metaAlwaysShow | boolean | 否 | 是否始终显示 |
| sortOrder | number | 否 | 排序顺序 |

### UpdateMenuDto
继承 CreateMenuDto 所有字段，额外包含：
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| id | string | 是 | 菜单ID |
| status | string | 否 | 状态：active/inactive |

## 错误码

| 错误码 | 描述 |
|--------|------|
| 400 | 参数验证失败 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 404 | 菜单不存在 |
| 409 | 菜单路径已存在 |
| 500 | 服务器内部错误 |

## 使用示例

```javascript
// 获取菜单列表
const response = await fetch('/menus', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token'
  }
});

// 创建菜单
const createResponse = await fetch('/menus/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({
    path: '/system/user',
    name: 'UserManagement',
    metaTitle: '用户管理',
    metaIcon: 'carbon:user',
    sortOrder: 1
  })
});
```

## 版本历史

- v1.0.0 (2023-06-24): 初始版本发布