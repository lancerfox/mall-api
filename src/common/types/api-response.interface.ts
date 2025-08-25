/**
 * API响应接口
 * 定义统一的API响应格式
 */
export interface IApiResponse<T = any> {
  /**
   * 响应状态码
   * 0表示成功，非0表示错误
   */
  code: number;

  /**
   * 响应消息
   */
  message: string;

  /**
   * 响应数据
   */
  data: T | null;

  /**
   * 时间戳
   */
  timestamp?: string;

  /**
   * 格式化的验证错误
   */
  errors?: { [key: string]: string[] };
}

/**
 * 分页响应接口
 */
export interface IPaginatedResponse<T> {
  /**
   * 数据列表
   */
  items: T[];

  /**
   * 总数量
   */
  total: number;

  /**
   * 当前页码
   */
  page: number;

  /**
   * 每页数量
   */
  limit: number;

  /**
   * 总页数
   */
  totalPages: number;
}
