const { DataSource } = require('typeorm');
const path = require('path');

// 注册TypeScript支持
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'NodeNext',
    moduleResolution: 'NodeNext',
    target: 'ES2020',
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    skipLibCheck: true
  }
});

// 检测运行环境并加载对应的环境变量
function loadEnvironmentConfig() {
  // 检查是否是测试环境
  // const isTest =
  //   process.env.NODE_ENV === 'test' ||
  //   process.argv.includes('--test') ||
  //   process.env.npm_lifecycle_event === 'test' ||
  //   process.env.npm_lifecycle_event === 'test:cov';

  // if (isTest) {
  //   // 测试环境：优先加载测试环境变量，覆盖默认配置
  //   const testEnvPath = path.join(__dirname, '..', '.env.test');
  //   require('dotenv').config({ path: testEnvPath, override: true });
  //   console.log('🧪 检测到测试环境，使用测试数据库配置');
  //   return {
  //     DATABASE_URL: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL,
  //     environment: 'test',
  //   };
  // } else {
    // 开发/生产环境：加载默认环境变量
    require('dotenv').config();
    console.log('🚀 检测到开发/生产环境，使用默认数据库配置');
    
    // 构建数据库连接URL
    let databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
    
    if (!databaseUrl && process.env.DB_HOST) {
      // 使用传统连接参数构建URL
      const password = process.env.DB_PASSWORD ? process.env.DB_PASSWORD.replace(/"/g, '') : '';
      databaseUrl = `postgresql://${process.env.DB_USERNAME}:${password}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
      console.log('🔧 使用传统连接参数构建数据库URL');
    }
    
    return {
      DATABASE_URL: databaseUrl,
      environment: process.env.NODE_ENV || 'development',
    };
  // }
}

const config = loadEnvironmentConfig();
const DATABASE_URL = config.DATABASE_URL;
const ENVIRONMENT = config.environment;

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
  let dataSource;

  try {
    console.log(`🚀 开始初始化 RBAC 权限系统... (环境: ${ENVIRONMENT})`);

    if (!DATABASE_URL) {
      console.error('❌ 数据库连接URL未配置，请检查环境变量');
      console.error('   当前环境变量:', {
        DATABASE_URL: process.env.DATABASE_URL,
        SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USERNAME: process.env.DB_USERNAME,
        DB_DATABASE: process.env.DB_DATABASE,
        NODE_ENV: process.env.NODE_ENV
      });
      throw new Error('数据库连接URL未配置，请检查环境变量 DATABASE_URL、SUPABASE_DB_URL 或传统DB_*参数');
    }

    console.log(`📡 连接数据库: ${DATABASE_URL}`);

    // 创建数据源连接
    dataSource = new DataSource({
      type: 'postgres',
      url: DATABASE_URL,
      entities: [
        path.join(__dirname, '../src/**/*.entity{.ts,.js}'),
      ],
      synchronize: false, // 禁用自动同步，使用手动初始化
      logging: true,
      extra: {
        // 设置连接池选项
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 20000,
      }
    });

    await dataSource.initialize();
    console.log('✅ 数据库连接成功');

    // 获取Repository
    const permissionRepository = dataSource.getRepository('Permission');
    const roleRepository = dataSource.getRepository('Role');
    const userRepository = dataSource.getRepository('User');

    // 1. 初始化权限
    console.log('📝 初始化权限数据...');

    // 根据环境决定是否清空现有权限
    if (ENVIRONMENT === 'test') {
      // 测试环境：清空现有权限以确保数据一致性
      await permissionRepository.clear();
      console.log('🧹 测试环境：已清空现有权限数据');
    } else {
      // 生产环境：保留现有权限，只添加新的
      console.log('🔒 生产环境：保留现有权限数据');
    }

    let createdPermissions = 0;
    for (const permission of DEFAULT_PERMISSIONS) {
      const existingPermission = await permissionRepository.findOne({
        where: { name: permission.name },
      });
      
      if (!existingPermission) {
        await permissionRepository.save({
          ...permission,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        createdPermissions++;
      }
    }

    if (createdPermissions > 0) {
      console.log(`✅ 成功创建 ${createdPermissions} 个权限`);
    } else {
      console.log('ℹ️  权限数据已存在，跳过创建');
    }

    // 2. 初始化角色
    console.log('👥 初始化角色数据...');

    // 获取所有权限用于角色关联
    const allPermissions = await permissionRepository.find();

    for (const roleConfig of DEFAULT_ROLES) {
      const existingRole = await roleRepository.findOne({
        where: { name: roleConfig.name },
      });

      // 获取权限ID
      const permissions = allPermissions.filter(p => 
        roleConfig.permissions.includes(p.name)
      );

      if (!existingRole) {
        await roleRepository.save({
          name: roleConfig.name,
          type: roleConfig.type,
          description: roleConfig.description,
          permissions: permissions,
          status: 'active',
          isSystem: roleConfig.isSystem,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(
          `✅ 成功创建角色: ${roleConfig.name} (${permissions.length} 个权限)`,
        );
      } else {
        // 更新现有角色的权限和类型
        existingRole.type = roleConfig.type;
        existingRole.permissions = permissions;
        existingRole.updatedAt = new Date();
        
        await roleRepository.save(existingRole);

        console.log(
          `✅ 已修复角色权限和类型: ${roleConfig.name} (${permissions.length} 个权限)`,
        );
      }
    }

    // 3. 修复现有超级管理员用户角色
    console.log('👤 查找并修复超级管理员用户角色...');
    const superAdminRole = await roleRepository.findOne({
      where: { type: 'super_admin' },
      relations: ['users'],
    });

    if (superAdminRole) {
      // 查找所有用户
      const allUsers = await userRepository.find({
        relations: ['roles'],
      });

      // 查找超级管理员用户
      const superAdminUsers = allUsers.filter(user => 
        user.roles && user.roles.some(role => role.id === superAdminRole.id)
      );

      if (superAdminUsers.length > 0) {
        console.log('🔍 找到超级管理员用户:');
        superAdminUsers.forEach(user => {
          console.log(`   - ${user.username} (${user.email || '无邮箱'})`);
        });

        // 修复超级管理员用户的权限
        for (const user of superAdminUsers) {
          user.roles = [superAdminRole];
          user.updatedAt = new Date();
          await userRepository.save(user);
        }

        console.log(`✅ 已修复 ${superAdminUsers.length} 个超级管理员用户角色`);
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
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 运行初始化
if (require.main === module) {
  // 从命令行参数检查是否指定了环境
  const args = process.argv.slice(2);
  if (args.includes('--test')) {
    process.env.NODE_ENV = 'test';
  }

  initRBACSystem();
}

module.exports = { initRBACSystem };