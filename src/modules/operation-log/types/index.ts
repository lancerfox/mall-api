// 操作日志模块类型定义
export interface IOperationLog {
  id: string;
  userId: string;
  username: string;
  module: string;
  operationType: string;
  description: string;
  method: string;
  url: string;
  ip: string;
  userAgent?: string;
  createdAt: Date;
}
