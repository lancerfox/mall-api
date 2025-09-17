#!/usr/bin/env node

/**
 * 测试环境RBAC系统初始化脚本
 *
 * 使用方法：
 * node scripts/init-test-rbac.js
 *
 * 或者：
 * npm run init:test-rbac
 */

// 设置测试环境并确保加载测试配置
process.env.NODE_ENV = 'test';
const path = require('path');
const testEnvPath = path.join(__dirname, '..', '.env.test');
require('dotenv').config({ path: testEnvPath, override: true });

// 引入RBAC初始化函数
const { initRBACSystem } = require('./init-rbac-system');

console.log('🧪 开始初始化测试环境RBAC系统...');
console.log('🔧 环境变量: NODE_ENV =', process.env.NODE_ENV);
console.log('📡 数据库连接:', process.env.DATABASE_URL);

// 执行初始化
initRBACSystem()
  .then(() => {
    console.log('✅ 测试环境RBAC系统初始化完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 测试环境RBAC系统初始化失败:', error);
    process.exit(1);
  });
