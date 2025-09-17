/**
 * RBAC系统测试环境初始化脚本
 * 用于在测试执行前初始化角色和权限数据
 */
import { spawn } from 'child_process';
import * as path from 'path';
import { config } from 'dotenv';

// 确保加载测试环境变量
process.env.NODE_ENV = 'test';
const testEnvPath = path.join(__dirname, '..', '..', '.env.test');
config({ path: testEnvPath, override: true });

/**
 * 初始化RBAC系统数据到测试数据库
 */
export const initTestRBACSystem = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('🔧 开始初始化测试环境RBAC系统...');

    const scriptPath = path.join(
      __dirname,
      '../../scripts/init-rbac-system.js',
    );

    // 使用子进程执行RBAC初始化脚本，并传递测试环境标识
    const childProcess = spawn('node', [scriptPath, '--test'], {
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
      stdio: 'pipe',
    });

    let output = '';
    let errorOutput = '';

    childProcess.stdout.on('data', (data) => {
      const message = data.toString();
      output += message;
      // 输出脚本执行过程信息
      console.log(message.trim());
    });

    childProcess.stderr.on('data', (data) => {
      const message = data.toString();
      errorOutput += message;
      console.error(message.trim());
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ RBAC系统初始化完成');
        resolve();
      } else {
        console.error('❌ RBAC系统初始化失败，退出代码:', code);
        console.error('错误输出:', errorOutput);
        reject(new Error(`RBAC初始化失败，退出代码: ${code}`));
      }
    });

    childProcess.on('error', (error) => {
      console.error('❌ 执行RBAC初始化脚本时出错:', error);
      reject(error);
    });
  });
};

/**
 * 检查RBAC系统是否已初始化
 */
export const checkRBACInitialized = async (): Promise<boolean> => {
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.DATABASE_URL);

    await client.connect();
    const db = client.db();

    // 检查是否有基础角色和权限
    const rolesCount = await db.collection('roles').countDocuments();
    const permissionsCount = await db
      .collection('permissions')
      .countDocuments();

    await client.close();

    const isInitialized = rolesCount > 0 && permissionsCount > 0;
    console.log(
      `🔍 RBAC系统检查结果: ${isInitialized ? '已初始化' : '未初始化'} (角色: ${rolesCount}, 权限: ${permissionsCount})`,
    );

    return isInitialized;
  } catch (error) {
    console.warn('⚠️ 检查RBAC系统状态时出错:', error.message);
    return false;
  }
};

/**
 * 确保RBAC系统已初始化，如果未初始化则自动初始化
 */
export const ensureRBACInitialized = async (): Promise<void> => {
  const isInitialized = await checkRBACInitialized();

  if (!isInitialized) {
    console.log('📝 RBAC系统未初始化，开始自动初始化...');
    await initTestRBACSystem();
  } else {
    console.log('✅ RBAC系统已初始化，跳过初始化步骤');
  }
};
