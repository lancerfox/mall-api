require('dotenv').config(); // 加载环境变量
const { MongoClient } = require('mongodb');


// 数据库连接配置
const DATABASE_URL = process.env.DATABASE_URL;

// 默认权限列表 - 根据系统权限常量定义
const DEFAULT_PERMISSIONS = [
  // API权限 - 用户管理
  { name: 'api:user:create', description: '创建用户', type: 'api', module: 'user' },
  { name: 'api:user:read', description: '查看用户', type: 'api', module: 'user' },
  { name: 'api:user:update', description: '更新用户', type: 'api', module: 'user' },
  { name: 'api:user:delete', description: '删除用户', type: 'api', module: 'user' },
  { name: 'api:user:reset-password', description: '重置密码', type: 'api', module: 'user' },
  { name: 'api:user:update-status', description: '更新用户状态', type: 'api', module: 'user' },
  
  // API权限 - 权限管理
  { name: 'api:permission:create', description: '创建权限', type: 'api', module: 'permission' },
  { name: 'api:permission:read', description: '查看权限', type: 'api', module: 'permission' },
  { name: 'api:permission:update', description: '更新权限', type: 'api', module: 'permission' },
  { name: 'api:permission:delete', description: '删除权限', type: 'api', module: 'permission' },
  
  // API权限 - 系统管理
  { name: 'api:system:config', description: '系统配置', type: 'api', module: 'system' },
  { name: 'api:system:log', description: '系统日志', type: 'api', module: 'system' },
  
  // 页面权限
  { name: 'page:user:management', description: '用户管理页面', type: 'page', module: 'user' },
  { name: 'page:user:detail', description: '用户详情页面', type: 'page', module: 'user' },
  { name: 'page:user:create', description: '用户创建页面', type: 'page', module: 'user' },
  { name: 'page:permission:management', description: '权限管理页面', type: 'page', module: 'permission' },
  { name: 'page:system:management', description: '系统管理页面', type: 'page', module: 'system' },
  
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
    permissions: DEFAULT_PERMISSIONS.map(p => p.name)
  },
  {
    name: 'admin',
    type: 'admin',
    description: '管理员',
    isSystem: true,
    permissions: [
      'api:user:create', 'api:user:read', 'api:user:update', 'api:user:delete',
      'api:user:reset-password', 'api:user:update-status',
      'api:permission:read',
      'api:system:config', 'api:system:log',
      'page:user:management', 'page:user:detail', 'page:user:create',
      'page:permission:management', 'page:system:management',
      'operation:user:export', 'operation:user:import', 'operation:user:batch-delete',
      'operation:permission:assign', 'operation:permission:batch-update'
    ]
  },
  {
    name: 'operator',
    type: 'operator',
    description: '操作员',
    isSystem: true,
    permissions: [
      'api:user:read', 'api:user:update',
      'api:permission:read',
      'page:user:management', 'page:user:detail',
      'operation:user:export'
    ]
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
      
      // 获取权限ID
      const permissions = await permissionsCollection.find({
        name: { $in: roleConfig.permissions }
      }).toArray();
      
      const permissionIds = permissions.map(p => p._id);
      
      if (!existingRole) {
        await rolesCollection.insertOne({
          name: roleConfig.name,
          type: roleConfig.type,
          description: roleConfig.description,
          permissions: permissionIds,
          status: 'active',
          isSystem: roleConfig.isSystem,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`✅ 成功创建角色: ${roleConfig.name} (${permissionIds.length} 个权限)`);
      } else {
        // 修复现有角色的权限和类型
        await rolesCollection.updateOne(
          { name: roleConfig.name },
          {
            $set: {
              type: roleConfig.type,
              permissions: permissionIds,
              updatedAt: new Date()
            }
          }
        );
        
        console.log(`✅ 已修复角色权限和类型: ${roleConfig.name} (${permissionIds.length} 个权限)`);
      }
    }
    
    // 3. 修复现有超级管理员用户角色
    console.log('👤 修复超级管理员用户角色...');
    const usersCollection = db.collection('users');
    const superAdminRole = await rolesCollection.findOne({ name: 'super_admin' });
    
    if (superAdminRole) {
      const result = await usersCollection.updateOne(
        { username: 'super_admin' },
        {
          $set: {
            roles: [superAdminRole._id],
            updatedAt: new Date()
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log('✅ 已修复超级管理员用户角色');
      } else {
        console.log('ℹ️  超级管理员用户角色已正确配置，无需修改');
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