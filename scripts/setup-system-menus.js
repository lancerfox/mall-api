const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * 向数据库添加System目录下的页面菜单
 */
async function setupSystemMenus() {
  const mongoUri = process.env.DATABASE_URL;
  
  if (!mongoUri) {
    console.error('❌ 错误: 未找到 DATABASE_URL 环境变量');
    console.log('请确保在 .env 文件中配置了 DATABASE_URL');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);

  try {
    console.log('🔗 连接到 MongoDB...');
    await client.connect();
    
    const db = client.db();
    const menusCollection = db.collection('menus');

    // 定义System目录下的菜单数据
    const systemMenus = [
      {
        title: '系统管理',
        name: 'System',
        path: '/system',
        component: 'Layout',
        icon: 'system',
        sort: 100,
        type: 'menu',
        status: 'active',
        permission: 'system:view',
        hidden: false,
        keepAlive: true,
        parentId: null,
        meta: {
          title: '系统管理',
          icon: 'system',
          keepAlive: true
        }
      },
      {
        title: '菜单管理',
        name: 'SystemMenu',
        path: '/system/menu',
        component: 'system/menu/index',
        icon: 'menu',
        sort: 1,
        type: 'menu',
        status: 'active',
        permission: 'system:menu:view',
        hidden: false,
        keepAlive: true,
        parentId: null, // 将在插入后设置为系统管理的ID
        meta: {
          title: '菜单管理',
          icon: 'menu',
          keepAlive: true
        }
      },
      {
        title: '用户管理',
        name: 'SystemUser',
        path: '/system/user',
        component: 'system/user/index',
        icon: 'user',
        sort: 2,
        type: 'menu',
        status: 'active',
        permission: 'system:user:view',
        hidden: false,
        keepAlive: true,
        parentId: null, // 将在插入后设置为系统管理的ID
        meta: {
          title: '用户管理',
          icon: 'user',
          keepAlive: true
        }
      }
    ];

    console.log('📋 准备添加的菜单:');
    systemMenus.forEach((menu, index) => {
      console.log(`   ${index + 1}. ${menu.title} (${menu.path})`);
    });

    // 1. 检查是否已存在系统管理菜单
    console.log('\n🔍 检查现有菜单...');
    const existingSystemMenu = await menusCollection.findOne({ 
      name: 'System',
      path: '/system'
    });

    let systemMenuId;

    if (existingSystemMenu) {
      console.log('✅ 找到现有的系统管理菜单');
      systemMenuId = existingSystemMenu._id;
    } else {
      // 插入系统管理主菜单
      console.log('➕ 创建系统管理主菜单...');
      const systemMenuResult = await menusCollection.insertOne({
        ...systemMenus[0],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      systemMenuId = systemMenuResult.insertedId;
      console.log('✅ 系统管理主菜单创建成功');
    }

    // 2. 插入子菜单
    const subMenus = systemMenus.slice(1);
    let insertedCount = 0;
    let skippedCount = 0;

    for (const menu of subMenus) {
      // 检查菜单是否已存在
      const existingMenu = await menusCollection.findOne({
        name: menu.name,
        path: menu.path
      });

      if (existingMenu) {
        console.log(`⚠️  菜单 "${menu.title}" 已存在，跳过`);
        skippedCount++;
        continue;
      }

      // 设置父菜单ID并插入
      const menuToInsert = {
        ...menu,
        parentId: systemMenuId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await menusCollection.insertOne(menuToInsert);
      console.log(`✅ 菜单 "${menu.title}" 创建成功`);
      insertedCount++;
    }

    // 3. 添加菜单相关的按钮权限
    const menuButtons = [
      // 菜单管理按钮
      {
        title: '新增菜单',
        name: 'MenuCreate',
        path: '',
        component: '',
        icon: 'plus',
        sort: 1,
        type: 'button',
        status: 'active',
        permission: 'menu:create',
        hidden: false,
        keepAlive: false,
        parentId: null, // 将设置为菜单管理的ID
        meta: {
          title: '新增菜单'
        }
      },
      {
        title: '编辑菜单',
        name: 'MenuUpdate',
        path: '',
        component: '',
        icon: 'edit',
        sort: 2,
        type: 'button',
        status: 'active',
        permission: 'menu:update',
        hidden: false,
        keepAlive: false,
        parentId: null,
        meta: {
          title: '编辑菜单'
        }
      },
      {
        title: '删除菜单',
        name: 'MenuDelete',
        path: '',
        component: '',
        icon: 'delete',
        sort: 3,
        type: 'button',
        status: 'active',
        permission: 'menu:delete',
        hidden: false,
        keepAlive: false,
        parentId: null,
        meta: {
          title: '删除菜单'
        }
      },
      // 用户管理按钮
      {
        title: '新增用户',
        name: 'UserCreate',
        path: '',
        component: '',
        icon: 'plus',
        sort: 1,
        type: 'button',
        status: 'active',
        permission: 'user:create',
        hidden: false,
        keepAlive: false,
        parentId: null, // 将设置为用户管理的ID
        meta: {
          title: '新增用户'
        }
      },
      {
        title: '编辑用户',
        name: 'UserUpdate',
        path: '',
        component: '',
        icon: 'edit',
        sort: 2,
        type: 'button',
        status: 'active',
        permission: 'user:update',
        hidden: false,
        keepAlive: false,
        parentId: null,
        meta: {
          title: '编辑用户'
        }
      },
      {
        title: '删除用户',
        name: 'UserDelete',
        path: '',
        component: '',
        icon: 'delete',
        sort: 3,
        type: 'button',
        status: 'active',
        permission: 'user:delete',
        hidden: false,
        keepAlive: false,
        parentId: null,
        meta: {
          title: '删除用户'
        }
      },
      {
        title: '重置密码',
        name: 'UserResetPassword',
        path: '',
        component: '',
        icon: 'key',
        sort: 4,
        type: 'button',
        status: 'active',
        permission: 'user:reset-password',
        hidden: false,
        keepAlive: false,
        parentId: null,
        meta: {
          title: '重置密码'
        }
      }
    ];

    // 获取菜单管理和用户管理的ID
    const menuManagement = await menusCollection.findOne({ name: 'SystemMenu' });
    const userManagement = await menusCollection.findOne({ name: 'SystemUser' });

    if (menuManagement && userManagement) {
      console.log('\n➕ 添加按钮权限...');
      
      // 设置按钮的父菜单ID
      const menuButtonsToInsert = menuButtons.slice(0, 3).map(button => ({
        ...button,
        parentId: menuManagement._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const userButtonsToInsert = menuButtons.slice(3).map(button => ({
        ...button,
        parentId: userManagement._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      // 插入按钮权限
      let buttonInsertedCount = 0;
      for (const button of [...menuButtonsToInsert, ...userButtonsToInsert]) {
        const existingButton = await menusCollection.findOne({
          name: button.name,
          type: 'button'
        });

        if (!existingButton) {
          await menusCollection.insertOne(button);
          console.log(`✅ 按钮权限 "${button.title}" 创建成功`);
          buttonInsertedCount++;
        } else {
          console.log(`⚠️  按钮权限 "${button.title}" 已存在，跳过`);
        }
      }

      console.log(`📊 按钮权限统计: 新增 ${buttonInsertedCount} 个`);
    }

    // 4. 显示统计信息
    console.log('\n📊 菜单添加统计:');
    console.log(`   ✅ 新增菜单: ${insertedCount} 个`);
    console.log(`   ⚠️  跳过菜单: ${skippedCount} 个`);
    
    // 5. 验证结果
    console.log('\n🔍 验证菜单结构...');
    const allSystemMenus = await menusCollection.find({
      $or: [
        { name: 'System' },
        { parentId: systemMenuId }
      ]
    }).sort({ sort: 1 }).toArray();

    console.log('📋 当前系统菜单结构:');
    allSystemMenus.forEach(menu => {
      const indent = menu.parentId ? '   └─ ' : '├─ ';
      console.log(`${indent}${menu.title} (${menu.type}) - ${menu.permission || 'N/A'}`);
    });

    console.log('\n🎉 系统菜单设置完成!');

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
  setupSystemMenus()
    .then(() => {
      console.log('✨ 脚本执行完成!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 脚本执行出错:', error);
      process.exit(1);
    });
}

module.exports = { setupSystemMenus };