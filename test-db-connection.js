const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: '47.115.232.131',
    port: 5432,
    user: 'postgres',
    password: 'xxx13579!',
    database: 'postgres'
  });

  try {
    console.log('正在连接到数据库...');
    await client.connect();
    console.log('✅ 数据库连接成功');
    
    // 检查数据库是否存在
    const result = await client.query('SELECT datname FROM pg_database WHERE datname = $1', ['mall-api-test']);
    if (result.rows.length === 0) {
      console.log('数据库 mall-api-test 不存在，正在创建...');
      await client.query('CREATE DATABASE "mall-api-test"');
      console.log('✅ 数据库 mall-api-test 创建成功');
    } else {
      console.log('✅ 数据库 mall-api-test 已存在');
    }
    
    await client.end();
    console.log('✅ 连接已关闭');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }
}

testConnection();