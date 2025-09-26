#!/usr/bin/env node

/**
 * 开发环境RBAC系统初始化脚本 (PostgreSQL版本)
 *
 * 使用方法：
 * node scripts/init-dev-rbac-postgres.js
 *
 * 或者：
 * npm run init:dev-rbac-postgres
 */

// 加载.env文件
require('dotenv').config();

// 引入RBAC初始化函数
const { initRBACSystem } = require('./init-rbac-system-postgres');

console.log('🚀 开始初始化开发环境RBAC系统 (PostgreSQL)...');
console.log('🔧 环境变量: NODE_ENV =', process.env.NODE_ENV);
console.log('📡 数据库连接:', process.env.DATABASE_URL);

// 执行初始化
initRBACSystem()
  .then(() => {
    console.log('✅ 开发环境RBAC系统初始化完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 开发环境RBAC系统初始化失败:', error);
    process.exit(1);
  });