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

  // 数据库类型
  DB_TYPE: Joi.string().required(),
  // 数据库主机
  DB_HOST: Joi.string().required(),
  // 数据库端口
  DB_PORT: Joi.number().required(),
  // 数据库用户名
  DB_USERNAME: Joi.string().required(),
  // 数据库密码
  DB_PASSWORD: Joi.string().required(),
  // 数据库名称
  DB_DATABASE: Joi.string().required(),
  // 数据库 schema
  DB_SCHEMA: Joi.string().required(),
  // 是否同步
  DB_SYNCHRONIZE: Joi.boolean().default(true),

  // JWT密钥
  JWT_SECRET: Joi.string().required(),

  // JWT访问令牌过期时间
  JWT_EXPIRES_IN: Joi.string().default('1h'),

  // 环境类型
  NODE_ENV: Joi.string()
    .valid(...Object.values(NodeEnv))
    .default(NodeEnv.DEVELOPMENT),

  // Supabase 配置
  SUPABASE_URL: Joi.string().required(),
  SUPABASE_SERVICE_KEY: Joi.string().required(),
  SUPABASE_BUCKET_NAME: Joi.string().default('mall-dev'),
});
