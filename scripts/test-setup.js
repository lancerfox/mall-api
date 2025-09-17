#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 检查MongoDB是否运行
function checkMongoDB() {
  try {
    execSync('mongosh --eval "db.adminCommand(\'ping\')"', {
      stdio: 'pipe',
      timeout: 5000,
    });
    console.log('✅ MongoDB 服务正常运行');
    return true;
  } catch (error) {
    console.error('❌ MongoDB 服务未运行或无法连接');
    console.log('请运行: brew services start mongodb-community@6.0');
    return false;
  }
}

// 创建测试环境文件
function setupTestEnv() {
  const envTestPath = path.join(__dirname, '..', '.env.test');

  if (!fs.existsSync(envTestPath)) {
    const testEnvContent = `
# 测试环境配置
DATABASE_URL=mongodb://localhost:27017/mall-api-test
JWT_SECRET=test-jwt-secret-key-for-unit-testing-only
NODE_ENV=test
PORT=3001
      `.trim();
    fs.writeFileSync(envTestPath, testEnvContent);
    console.log('✅ 已创建 .env.test 文件');
  } else {
    console.log('✅ .env.test 文件已存在');
  }
}

// 主函数
function main() {
  console.log('🚀 正在设置测试环境...\n');

  // 检查MongoDB
  if (!checkMongoDB()) {
    process.exit(1);
  }

  // 设置环境文件
  setupTestEnv();

  console.log('\n✅ 测试环境设置完成！');
  console.log('运行以下命令开始测试:');
  console.log('  npm test        # 运行所有测试');
  console.log('  npm run test:cov # 运行测试并生成覆盖率报告');
}

// 执行
main();
