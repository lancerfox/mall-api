import * as Joi from 'joi';

/**
 * Node环境
 */
export enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

/**
 * 环境变量验证模式
 * 定义应用程序所需的环境变量及其验证规则
 */
export const validationSchema = Joi.object({
  // 应用程序端口
  PORT: Joi.number().default(3000),

  // 数据库连接字符串
  DATABASE_URL: Joi.string().required(),

  // JWT密钥
  JWT_SECRET: Joi.string().required(),

  // JWT访问令牌过期时间
  JWT_EXPIRES_IN: Joi.string().default('1h'),

  // 环境类型
  NODE_ENV: Joi.string()
    .valid(...Object.values(NodeEnv))
    .default(NodeEnv.DEVELOPMENT),
});
