const { MongoClient } = require('mongodb');

// 数据库连接配置
const DATABASE_URL = process.env.DATABASE_URL || 
  'mongodb+srv://xiesp01:xie123456@cluster0.l63pjew.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// 旧角色到新角色的映射
const ROLE_MAPPING = {
  'super_admin': 'super_admin',
  'admin': 'admin',
  'operator': 'operator'
};

async function migrateToRBAC() {
  let client;
  
  try {
    console.log('🔄 开始迁移到 RBAC 系统...');
    
    // 连接数据库
    client = new MongoClient(DATABASE_URL);
    await client.connect();
    console.log('✅ 数据库连接成功');
    
    const db = client.db();
    
    // 1. 检查是否已经初始化了 RBAC 系统
    const rolesCollection = db.collection('roles');
    const roleCount = await rolesCollection.countDocuments();
    
    if (roleCount === 0) {
      console.log('⚠️  检测到 RBAC 系统未初始化，请先运行: npm run init-rbac');
      return;
    }
    
    // 2. 获取所有用户
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}).toArray();
    
    console.log(`📊 找到 ${users.length} 个用户需要迁移`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const user of users) {
      try {
        // 检查用户是否已经迁移（有 roles 字段且没有旧的 role 字段）
        if (user.roles && !user.role) {
          console.log(`⏭️  用户 ${user.username} 已经迁移，跳过`);
          skippedCount++;
          continue;
        }
        
        // 获取用户的旧角色
        const oldRole = user.role;
        if (!oldRole) {
          console.log(`⚠️  用户 ${user.username} 没有角色信息，跳过`);
          skippedCount++;
          continue;
        }
        
        // 映射到新角色
        const newRoleName = ROLE_MAPPING[oldRole];
        if (!newRoleName) {
          console.log(`⚠️  用户 ${user.username} 的角色 ${oldRole} 无法映射，跳过`);
          skippedCount++;
          continue;
        }
        
        // 查找新角色
        const newRole = await rolesCollection.findOne({ name: newRoleName });
        if (!newRole) {
          console.log(`❌ 找不到角色 ${newRoleName}，跳过用户 ${user.username}`);
          skippedCount++;
          continue;
        }
        
        // 更新用户：添加 roles 字段，移除旧的 role 和 permissions 字段
        const updateData = {
          roles: [newRole._id],
          updatedAt: new Date()
        };
        
        // 移除旧字段
        const unsetData = {
          role: "",
          permissions: ""
        };
        
        await usersCollection.updateOne(
          { _id: user._id },
          { 
            $set: updateData,
            $unset: unsetData
          }
        );
        
        console.log(`✅ 成功迁移用户 ${user.username}: ${oldRole} -> ${newRoleName}`);
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ 迁移用户 ${user.username} 失败:`, error.message);
        skippedCount++;
      }
    }
    
    console.log('\n📈 迁移统计:');
    console.log(`   ✅ 成功迁移: ${migratedCount} 个用户`);
    console.log(`   ⏭️  跳过: ${skippedCount} 个用户`);
    console.log(`   📊 总计: ${users.length} 个用户`);
    
    if (migratedCount > 0) {
      console.log('\n🎉 用户数据迁移完成！');
      console.log('💡 提示: 旧的 role 和 permissions 字段已被移除');
      console.log('💡 提示: 用户现在通过 roles 字段关联角色和权限');
    } else {
      console.log('\n ℹ️ 没有需要迁移的用户数据');
    }
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 运行迁移
if (require.main === module) {
  migrateToRBAC();
}

module.exports = { migrateToRBAC };