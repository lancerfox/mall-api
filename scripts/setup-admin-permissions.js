const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * 设置 admin 用户为 super_admin 并授予所有菜单权限的脚本
 */
async function setupAdminPermissions() {
  const mongoUri = process.env.DATABASE_URL;

  if (!mongoUri) {
    console.error('❌ 错误: 未找到 MONGODB_URI 环境变量');
    console.log('请确保在 .env 文件中配置了 MONGODB_URI');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);

  try {
    console.log('🔗 连接到 MongoDB...');
    await client.connect();

    const db = client.db();
    const usersCollection = db.collection('users');
    const menusCollection = db.collection('menus');

    // 1. 检查 admin 用户是否存在
    console.log('👤 查找 admin 用户...');
    const adminUser = await usersCollection.findOne({ username: 'admin' });

    if (!adminUser) {
      console.error('❌ 错误: 未找到用户名为 "admin" 的用户');
      console.log('请确保数据库中存在用户名为 "admin" 的用户');
      process.exit(1);
    }

    console.log(
      `✅ 找到 admin 用户: ${adminUser.username} (${adminUser.email})`,
    );

    // 2. 获取所有菜单的权限
    console.log('📋 获取所有菜单权限...');
    const menus = await menusCollection
      .find({
        permission: { $exists: true, $ne: null, $ne: '' },
      })
      .toArray();

    const menuPermissions = [
      ...new Set(menus.map((menu) => menu.permission).filter(Boolean)),
    ];
    console.log(`📝 找到 ${menuPermissions.length} 个菜单权限:`);
    menuPermissions.forEach((permission) => console.log(`   - ${permission}`));

    // 3. 预定义的系统权限（来自 PERMISSIONS 常量）
    const systemPermissions = [
      'user:create',
      'user:read',
      'user:update',
      'user:delete',
      'user:reset-password',
      'user:update-status',
      'system:config',
      'system:log',
      'permission:assign',
      'permission:view',
    ];

    // 4. 前端路由中定义的动态权限（来自 mall-admin 路由配置）
    const routePermissions = [
      // 系统管理权限
      'system:view',
      'user:view',
      'menu:view',

      // 仪表板权限
      'dashboard:view',

      // 多级菜单权限
      'level:view',
      'level:menu2:view',
    ];

    // 5. 合并所有权限并去重
    const allPermissions = [
      ...new Set([
        ...menuPermissions,
        ...systemPermissions,
        ...routePermissions,
      ]),
    ].sort();
    console.log(`🔐 总共 ${allPermissions.length} 个权限将被授予`);
    console.log('📋 权限详情:');
    console.log(`   - 菜单权限: ${menuPermissions.length} 个`);
    console.log(`   - 系统权限: ${systemPermissions.length} 个`);
    console.log(`   - 路由权限: ${routePermissions.length} 个`);

    // 6. 更新 admin 用户
    console.log('🔄 更新 admin 用户权限...');
    const updateResult = await usersCollection.updateOne(
      { username: 'admin' },
      {
        $set: {
          role: 'super_admin',
          permissions: allPermissions,
          updatedAt: new Date(),
        },
      },
    );

    if (updateResult.modifiedCount === 1) {
      console.log('✅ 成功更新 admin 用户!');
      console.log(`   - 角色: admin → super_admin`);
      console.log(`   - 权限数量: ${allPermissions.length}`);
      console.log('');
      console.log('🎉 admin 用户现在拥有超级管理员权限和所有菜单权限!');
    } else {
      console.log('⚠️  用户信息可能没有变化（已经是最新状态）');
    }

    // 7. 验证更新结果
    console.log('🔍 验证更新结果...');
    const updatedUser = await usersCollection.findOne(
      { username: 'admin' },
      { projection: { password: 0 } },
    );

    console.log('📊 更新后的用户信息:');
    console.log(`   用户名: ${updatedUser.username}`);
    console.log(`   角色: ${updatedUser.role}`);
    console.log(`   权限数量: ${updatedUser.permissions?.length || 0}`);
    console.log(`   状态: ${updatedUser.status}`);
  } catch (error) {
    console.error('❌ 脚本执行失败:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 数据库连接已关闭');
  }
}

// 执行脚本
if (require.main === module) {
  setupAdminPermissions()
    .then(() => {
      console.log('✨ 脚本执行完成!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 脚本执行出错:', error);
      process.exit(1);
    });
}

module.exports = { setupAdminPermissions };
