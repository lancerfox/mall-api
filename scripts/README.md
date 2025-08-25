# Admin 权限设置脚本

这个脚本用于将 `admin` 用户设置为超级管理员，并授予所有菜单权限。

## 使用方法

### 1. 确保环境配置正确

确保 `mall-api/.env` 文件中配置了正确的 MongoDB 连接字符串：

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database
```

### 2. 运行脚本

在 `mall-api` 目录下执行以下命令：

```bash
npm run setup-admin
```

### 3. 脚本执行内容

脚本会自动完成以下操作：

1. **连接数据库** - 使用 `.env` 文件中的 `MONGODB_URI` 连接到 MongoDB Atlas
2. **查找 admin 用户** - 确认数据库中存在用户名为 `admin` 的用户
3. **获取所有菜单权限** - 从数据库中的 `menus` 集合获取所有菜单的权限标识
4. **合并系统权限** - 包含所有预定义的系统权限（用户管理、菜单管理等）
5. **更新用户信息** - 将 admin 用户的角色设置为 `super_admin`，并授予所有权限

### 4. 权限列表

脚本会授予以下权限：

#### 菜单权限（从数据库动态获取）
- 所有在 `menus` 集合中定义的权限

#### 系统权限（预定义）
- `user:create` - 创建用户
- `user:read` - 查看用户
- `user:update` - 更新用户
- `user:delete` - 删除用户
- `user:reset-password` - 重置密码
- `user:update-status` - 更新用户状态
- `menu:create` - 创建菜单
- `menu:read` - 查看菜单
- `menu:update` - 更新菜单
- `menu:delete` - 删除菜单
- `menu:sort` - 菜单排序
- `system:config` - 系统配置
- `system:log` - 系统日志
- `permission:assign` - 分配权限
- `permission:view` - 查看权限

#### 动态路由权限（来自前端路由配置）
- `system:view` - 系统管理模块访问
- `system:user:view` - 用户管理页面访问
- `system:menu:view` - 菜单管理页面访问
- `dashboard:view` - 仪表板访问
- `level:view` - 多级菜单模块访问
- `level:menu1:view` - 一级菜单访问
- `level:menu1-1:view` - 二级菜单访问
- `level:menu1-1-1:view` - 三级菜单访问
- `level:menu1-2:view` - 二级菜单2访问
- `level:menu2:view` - 一级菜单2访问

### 5. 执行结果

脚本执行成功后，你会看到类似以下的输出：

```
🔗 连接到 MongoDB...
👤 查找 admin 用户...
✅ 找到 admin 用户: admin (admin@example.com)
📋 获取所有菜单权限...
📝 找到 X 个菜单权限:
   - system:user:view
   - system:menu:view
   - ...
🔐 总共 X 个权限将被授予
🔄 更新 admin 用户权限...
✅ 成功更新 admin 用户!
   - 角色: admin → super_admin
   - 权限数量: X
🎉 admin 用户现在拥有超级管理员权限和所有菜单权限!
```

### 6. 注意事项

- 确保数据库中已存在用户名为 `admin` 的用户
- 脚本会自动去重权限，避免重复
- 执行前请确保有数据库的写入权限
- 建议在测试环境先验证脚本功能

### 7. 故障排除

如果遇到问题，请检查：

1. **数据库连接** - 确认 `MONGODB_URI` 配置正确
2. **用户存在** - 确认数据库中存在 `admin` 用户
3. **网络连接** - 确认能够连接到 MongoDB Atlas
4. **权限** - 确认数据库用户有读写权限

### 8. 验证结果

脚本执行完成后，可以通过以下方式验证：

1. 登录管理后台，使用 `admin` 账户
2. 检查是否能访问所有菜单功能
3. 在用户管理页面查看 `admin` 用户的角色和权限