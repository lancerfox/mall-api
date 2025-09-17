import { connect, connection, ConnectOptions } from 'mongoose';
import { config } from 'dotenv';
import * as path from 'path';

// 确保加载测试环境变量并覆盖默认配置
process.env.NODE_ENV = 'test';
const testEnvPath = path.join(__dirname, '..', '..', '.env.test');
config({ path: testEnvPath, override: true });

console.log('🔧 测试环境配置加载完成，数据库连接:', process.env.DATABASE_URL);

/**
 * 连接到测试数据库
 */
export const connectTestDB = async (): Promise<void> => {
  const dbUri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/mall-api-test';
  const options: ConnectOptions = {
    dbName: process.env.DATABASE_NAME || 'mall-api-test',
    maxPoolSize: 5,
    minPoolSize: 1,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 10000,
  };

  try {
    await connect(dbUri, options);
    console.log('测试数据库连接成功');
  } catch (error) {
    console.error('测试数据库连接失败:', error);
    throw error;
  }
};

/**
 * 清空测试数据库（保留RBAC数据）
 */
export const clearTestDB = async (): Promise<void> => {
  const collections = connection.collections;

  // 定义需要保留的集合（RBAC系统数据）
  const preserveCollections = ['roles', 'permissions'];

  for (const key in collections) {
    try {
      if (preserveCollections.includes(key)) {
        console.log(`🔒 保留RBAC集合: ${key}`);
        continue; // 跳过RBAC相关集合
      }

      await collections[key].deleteMany({});
      console.log(`🧹 已清空集合: ${key}`);
    } catch (error) {
      console.warn(`清空集合 ${key} 时出错:`, error);
    }
  }
};

/**
 * 强制清空所有数据（包括RBAC数据）
 */
export const clearAllTestDB = async (): Promise<void> => {
  const collections = connection.collections;

  for (const key in collections) {
    try {
      await collections[key].deleteMany({});
      console.log(`🧹 已清空所有数据 - 集合: ${key}`);
    } catch (error) {
      console.warn(`清空集合 ${key} 时出错:`, error);
    }
  }
};

/**
 * 断开数据库连接
 */
export const disconnectTestDB = async (): Promise<void> => {
  try {
    await connection.close();
    console.log('测试数据库连接已断开');
  } catch (error) {
    console.error('断开数据库连接时出错:', error);
    throw error;
  }
};

/**
 * 获取数据库连接状态
 */
export const getDBConnectionState = (): number => {
  return connection.readyState;
};
