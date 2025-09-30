import { config } from 'dotenv';
import { join } from 'path';

// 加载测试环境变量
config({ path: join(__dirname, '../../.env.test') });