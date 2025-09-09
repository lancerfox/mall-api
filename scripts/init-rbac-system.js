require('dotenv').config(); // 加载环境变量
const { MongoClient } = require('mongodb');

// 数据库连接配置
const DATABASE_URL = process.env.DATABASE_URL;

// 默认权限列表 - 根据系统权限常量定义
const DEFAULT_PERMISSIONS = [
  // API权限 - 用户管理
  {
    name: 'api:user:list',
    description: '获取用户列表',
    type: 'api',
    module: 'user',
  },
  {
    name: 'api:user:create',
    description: '创建用户',
    type: 'api',
    module: 'user',
  },
  {
    name: 'api:user:update',
    description: '更新用户',
    type: 'api',
    module: 'user',
  },
  {
    name: 'api:user:delete',
    description: '删除用户',
    type: 'api',
    module: 'user',
  },
  {
    name: 'api:user:reset-password',
    description: '重置密码',
    type: 'api',
    module: 'user',
  },
  // API权限 - 角色管理
  {
    name: 'api:role:list',
    description: '获取角色列表',
    type: 'api',
    module: 'role',
  },
  {
    name: 'api:role:create',
    description: '创建角色',
    type: 'api',
    module: 'role',
  },
  {
    name: 'api:role:delete',
    description: '删除角色',
    type: 'api',
    module: 'role',
  },
  {
    name: 'api:role:update-permissions',
    description: '更新角色权限',
    type: 'api',
    module: 'role',
  },
  {
    name: 'api:role:permissions',
    description: '获取角色权限',
    type: 'api',
    module: 'role',
  },
  {
    name: 'api:role:types',
    description: '获取角色类型',
    type: 'api',
    module: 'role',
  },
  // API权限 - 权限管理
  {
    name: 'api:permission:list',
    description: '获取权限列表',
    type: 'api',
    module: 'permission',
  },
  {
    name: 'api:permission:create',
    description: '创建权限',
    type: 'api',
    module: 'permission',
  },
  {
    name: 'api:permission:update',
    description: '更新权限',
    type: 'api',
    module: 'permission',
  },
  {
    name: 'api:permission:delete',
    description: '删除权限',
    type: 'api',
    module: 'permission',
  },
  // API权限 - 菜单管理
  {
    name: 'api:menu:list',
    description: '获取菜单列表',
    type: 'api',
    module: 'menu',
  },
  {
    name: 'api:menu:create',
    description: '创建菜单',
    type: 'api',
    module: 'menu',
  },
  {
    name: 'api:menu:update',
    description: '更新菜单',
    type: 'api',
    module: 'menu',
  },
  {
    name: 'api:menu:delete',
    description: '删除菜单',
    type: 'api',
    module: 'menu',
  },
  // API权限 - 认证相关
  {
    name: 'api:auth:change-password',
    description: '修改密码',
    type: 'api',
    module: 'auth',
  },
  // 页面权限
  //用户管理
  {
    name: 'page:user:usermanagement',
    description: '用户管理',
    type: 'page',
    module: 'user',
  },
  {
    name: 'page:user:usermanagementlist',
    description: '用户管理列表',
    type: 'page',
    module: 'user',
  },
  {
    name: 'operation:user:createBtn',
    description: '新增用户按钮',
    type: 'operation',
    module: 'user',
  },
  //菜单管理
  {
    name: 'page:menu:menumanagement',
    description: '菜单管理',
    type: 'page',
    module: 'menu',
  },
  {
    name: 'page:menu:menumanagementlist',
    description: '菜单管理列表',
    type: 'page',
    module: 'menu',
  },
  // 操作权限
  // { name: 'operation:user:export', description: '用户导出', type: 'operation', module: 'user' },
  // { name: 'operation:user:import', description: '用户导入', type: 'operation', module: 'user' },
  // { name: 'operation:user:batch-delete', description: '用户批量删除', type: 'operation', module: 'user' },
  // { name: 'operation:permission:assign', description: '权限分配', type: 'operation', module: 'permission' },
  // { name: 'operation:permission:batch-update', description: '权限批量更新', type: 'operation', module: 'permission' }
];

// 默认角色配置 - 修复超级管理员权限问题
const DEFAULT_ROLES = [
  {
    name: 'super_admin',
    type: 'super_admin',
    description: '超级管理员',
    isSystem: true,
    // 超级管理员应该拥有所有权限
    permissions: DEFAULT_PERMISSIONS.map((p) => p.name),
  },
  {
    name: 'admin',
    type: 'admin',
    description: '管理员',
    isSystem: true,
    permissions: [],
  },
  {
    name: 'operator',
    type: 'operator',
    description: '操作员',
    isSystem: true,
    permissions: [],
  },
];

async function initRBACSystem() {
  let client;

  try {
    console.log('🚀 开始初始化 RBAC 权限系统...');

    // 连接数据库
    client = new MongoClient(DATABASE_URL);
    await client.connect();
    console.log('✅ 数据库连接成功');

    const db = client.db();

    // 1. 初始化权限
    console.log('📝 初始化权限数据...');
    const permissionsCollection = db.collection('permissions');

    // 清空现有权限（可选）
    await permissionsCollection.deleteMany({});

    const permissionDocs = [];
    for (const permission of DEFAULT_PERMISSIONS) {
      const existingPermission = await permissionsCollection.findOne({
        name: permission.name,
      });
      if (!existingPermission) {
        permissionDocs.push({
          ...permission,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    if (permissionDocs.length > 0) {
      await permissionsCollection.insertMany(permissionDocs);
      console.log(`✅ 成功创建 ${permissionDocs.length} 个权限`);
    } else {
      console.log('ℹ️  权限数据已存在，跳过创建');
    }

    // 2. 初始化角色
    console.log('👥 初始化角色数据...');
    const rolesCollection = db.collection('roles');

    for (const roleConfig of DEFAULT_ROLES) {
      const existingRole = await rolesCollection.findOne({
        name: roleConfig.name,
      });

      // 获取权限ID
      const permissions = await permissionsCollection
        .find({
          name: { $in: roleConfig.permissions },
        })
        .toArray();

      const permissionIds = permissions.map((p) => p._id);

      if (!existingRole) {
        await rolesCollection.insertOne({
          name: roleConfig.name,
          type: roleConfig.type,
          description: roleConfig.description,
          permissions: permissionIds,
          status: 'active',
          isSystem: roleConfig.isSystem,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(
          `✅ 成功创建角色: ${roleConfig.name} (${permissionIds.length} 个权限)`,
        );
      } else {
        // 修复现有角色的权限和类型
        await rolesCollection.updateOne(
          { name: roleConfig.name },
          {
            $set: {
              type: roleConfig.type,
              permissions: permissionIds,
              updatedAt: new Date(),
            },
          },
        );

        console.log(
          `✅ 已修复角色权限和类型: ${roleConfig.name} (${permissionIds.length} 个权限)`,
        );
      }
    }

    // 3. 修复现有超级管理员用户角色
    console.log('👤 查找并修复超级管理员用户角色...');
    const usersCollection = db.collection('users');
    const superAdminRole = await rolesCollection.findOne({
      type: 'super_admin',
    });

    if (superAdminRole) {
      // 查找所有用户
      const allUsers = await usersCollection.find({}).toArray();
      
      // 查找超级管理员用户
      const superAdminUsers = allUsers.filter(user => 
        user.roles && user.roles.length > 0 && 
        user.roles.some(roleId => roleId.equals(superAdminRole._id))
      );

      if (superAdminUsers.length > 0) {
        console.log('🔍 找到超级管理员用户:');
        superAdminUsers.forEach(user => {
          console.log(`   - ${user.username} (${user.email || '无邮箱'})`);
        });

        // 修复超级管理员用户的权限
        const result = await usersCollection.updateMany(
          { 
            _id: { $in: superAdminUsers.map(user => user._id) }
          },
          {
            $set: {
              roles: [superAdminRole._id],
              updatedAt: new Date(),
            },
          },
        );

        if (result.modifiedCount > 0) {
          console.log(`✅ 已修复 ${result.modifiedCount} 个超级管理员用户角色`);
        } else {
          console.log('ℹ️  超级管理员用户角色已正确配置，无需修改');
        }
      } else {
        console.log('ℹ️  未找到超级管理员用户，跳过用户角色修复');
      }
    } else {
      console.log('ℹ️  未找到超级管理员角色，跳过用户角色修复');
    }

    console.log('🎉 RBAC 权限系统初始化完成！');
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 运行初始化
if (require.main === module) {
  initRBACSystem();
}

module.exports = { initRBACSystem };
