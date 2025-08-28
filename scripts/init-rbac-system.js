const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// 数据库连接配置
const DATABASE_URL = process.env.DATABASE_URL || 
  'mongodb+srv://xiesp01:xie123456@cluster0.l63pjew.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// 默认权限列表
const DEFAULT_PERMISSIONS = [
  // 用户管理权限
  { name: 'user:create', description: '创建用户', module: 'user' },
  { name: 'user:read', description: '查看用户', module: 'user' },
  { name: 'user:update', description: '更新用户', module: 'user' },
  { name: 'user:delete', description: '删除用户', module: 'user' },
  
  // 角色管理权限
  { name: 'role:create', description: '创建角色', module: 'role' },
  { name: 'role:read', description: '查看角色', module: 'role' },
  { name: 'role:update', description: '更新角色', module: 'role' },
  { name: 'role:delete', description: '删除角色', module: 'role' },
  
  // 权限管理权限
  { name: 'permission:create', description: '创建权限', module: 'permission' },
  { name: 'permission:read', description: '查看权限', module: 'permission' },
  { name: 'permission:update', description: '更新权限', module: 'permission' },
  { name: 'permission:delete', description: '删除权限', module: 'permission' },
  
  // 系统管理权限
  { name: 'system:config', description: '系统配置', module: 'system' },
  { name: 'system:log', description: '系统日志', module: 'system' },
];

// 默认角色配置
const DEFAULT_ROLES = [
  {
    name: 'super_admin',
    description: '超级管理员',
    isSystem: true,
    permissions: [
      'user:create', 'user:read', 'user:update', 'user:delete',
      'role:create', 'role:read', 'role:update', 'role:delete',
      'permission:create', 'permission:read', 'permission:update', 'permission:delete',
      'system:config', 'system:log'
    ]
  },
  {
    name: 'admin',
    description: '管理员',
    isSystem: true,
    permissions: [
      'user:read', 'user:update',
      'role:read',
      'permission:read',
      'system:config'
    ]
  },
  {
    name: 'operator',
    description: '操作员',
    isSystem: true,
    permissions: [
      'user:read',
      'role:read',
      'permission:read'
    ]
  }
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
    // await permissionsCollection.deleteMany({});
    
    const permissionDocs = [];
    for (const permission of DEFAULT_PERMISSIONS) {
      const existingPermission = await permissionsCollection.findOne({ name: permission.name });
      if (!existingPermission) {
        permissionDocs.push({
          ...permission,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
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
      const existingRole = await rolesCollection.findOne({ name: roleConfig.name });
      if (!existingRole) {
        // 获取权限ID
        const permissions = await permissionsCollection.find({
          name: { $in: roleConfig.permissions }
        }).toArray();
        
        const permissionIds = permissions.map(p => p._id);
        
        await rolesCollection.insertOne({
          name: roleConfig.name,
          description: roleConfig.description,
          permissions: permissionIds,
          status: 'active',
          isSystem: roleConfig.isSystem,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`✅ 成功创建角色: ${roleConfig.name}`);
      } else {
        console.log(`ℹ️  角色 ${roleConfig.name} 已存在，跳过创建`);
      }
    }
    
    // 3. 创建默认超级管理员用户
    console.log('👤 初始化超级管理员用户...');
    const usersCollection = db.collection('users');
    
    const superAdminUser = await usersCollection.findOne({ username: 'super_admin' });
    if (!superAdminUser) {
      // 获取超级管理员角色ID
      const superAdminRole = await rolesCollection.findOne({ name: 'super_admin' });
      
      if (superAdminRole) {
        const hashedPassword = await bcrypt.hash('admin123456', 10);
        
        await usersCollection.insertOne({
          username: 'super_admin',
          password: hashedPassword,
          roles: [superAdminRole._id],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log('✅ 成功创建超级管理员用户');
        console.log('📋 登录信息:');
        console.log('   用户名: super_admin');
        console.log('   密码: admin123456');
      } else {
        console.error('❌ 未找到超级管理员角色，无法创建用户');
      }
    } else {
      console.log('ℹ️  超级管理员用户已存在，跳过创建');
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