#!/usr/bin/env node

/**
 * 数据库连接验证脚本
 * 用于验证测试环境是否正确连接到本地数据库
 */

// 设置测试环境
process.env.NODE_ENV = 'test';
const path = require('path');
const testEnvPath = path.join(__dirname, '..', '.env.test');
require('dotenv').config({ path: testEnvPath, override: true });

const { MongoClient } = require('mongodb');

async function verifyDatabaseConnection() {
  console.log('🔍 验证测试环境数据库连接...');
  console.log('📧 环境变量 NODE_ENV:', process.env.NODE_ENV);
  console.log('📡 数据库连接URL:', process.env.DATABASE_URL);

  try {
    const client = new MongoClient(process.env.DATABASE_URL);
    await client.connect();

    const admin = client.db().admin();
    const dbInfo = await admin.listDatabases();

    console.log('✅ 数据库连接成功！');
    console.log('📋 可用数据库列表:');
    dbInfo.databases.forEach((db) => {
      console.log(
        `   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`,
      );
    });

    // 检查测试数据库
    const testDb = client.db('mall-api-test');
    const collections = await testDb.listCollections().toArray();

    console.log('\n📦 测试数据库集合:');
    if (collections.length === 0) {
      console.log('   (空数据库)');
    } else {
      collections.forEach((collection) => {
        console.log(`   - ${collection.name}`);
      });
    }

    await client.close();
    console.log('\n✅ 验证完成，数据库连接正常！');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }
}

verifyDatabaseConnection();
