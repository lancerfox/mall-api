import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import {
  OperationLog,
  OperationLogDocument,
} from '../entities/operation-log.entity';
import { CreateOperationLogDto } from '../dto/create-operation-log.dto';
import { OperationLogQueryDto } from '../dto/operation-log-response.dto';

interface IAggregationGroup {
  _id: string;
  count: number;
}

@Injectable()
export class OperationLogService {
  constructor(
    @InjectModel(OperationLog.name)
    private operationLogModel: Model<OperationLogDocument>,
  ) {}

  /**
   * 创建操作日志
   * @param createOperationLogDto 操作日志数据
   * @returns 创建的操作日志
   */
  async create(
    createOperationLogDto: CreateOperationLogDto,
  ): Promise<OperationLog> {
    const createdLog = new this.operationLogModel(createOperationLogDto);
    return createdLog.save();
  }

  /**
   * 记录登录日志
   * @param userId 用户ID
   * @param username 用户名
   * @param ip IP地址
   * @param userAgent 用户代理
   * @param status 登录状态
   * @param errorMessage 错误信息（如果有）
   */
  async logLogin(
    userId: string,
    username: string,
    ip?: string,
    userAgent?: string,
    status: 'success' | 'error' = 'success',
    errorMessage?: string,
  ): Promise<OperationLog> {
    const logData: CreateOperationLogDto = {
      userId,
      username,
      action: 'login',
      module: 'auth',
      description: status === 'success' ? '用户登录成功' : '用户登录失败',
      ip,
      userAgent,
      status,
      errorMessage,
      method: 'POST',
      url: '/api/auth/login',
    };

    return this.create(logData);
  }

  /**
   * 记录退出登录日志
   * @param userId 用户ID
   * @param username 用户名
   * @param ip IP地址
   * @param userAgent 用户代理
   */
  async logLogout(
    userId: string,
    username: string,
    ip?: string,
    userAgent?: string,
  ): Promise<OperationLog> {
    const logData: CreateOperationLogDto = {
      userId,
      username,
      action: 'logout',
      module: 'auth',
      description: '用户退出登录',
      ip,
      userAgent,
      status: 'success',
      method: 'POST',
      url: '/api/auth/logout',
    };

    return this.create(logData);
  }

  /**
   * 记录密码修改日志
   * @param userId 用户ID
   * @param username 用户名
   * @param ip IP地址
   * @param userAgent 用户代理
   * @param status 操作状态
   * @param errorMessage 错误信息（如果有）
   */
  async logPasswordChange(
    userId: string,
    username: string,
    ip?: string,
    userAgent?: string,
    status: 'success' | 'error' = 'success',
    errorMessage?: string,
  ): Promise<OperationLog> {
    const logData: CreateOperationLogDto = {
      userId,
      username,
      action: 'change_password',
      module: 'auth',
      description:
        status === 'success' ? '用户修改密码成功' : '用户修改密码失败',
      ip,
      userAgent,
      status,
      errorMessage,
      method: 'PUT',
      url: '/api/auth/password',
    };

    return this.create(logData);
  }

  /**
   * 记录用户资料更新日志
   * @param userId 用户ID
   * @param username 用户名
   * @param ip IP地址
   * @param userAgent 用户代理
   * @param status 操作状态
   * @param errorMessage 错误信息（如果有）
   */
  async logProfileUpdate(
    userId: string,
    username: string,
    ip?: string,
    userAgent?: string,
    status: 'success' | 'error' = 'success',
    errorMessage?: string,
  ): Promise<OperationLog> {
    const logData: CreateOperationLogDto = {
      userId,
      username,
      action: 'update_profile',
      module: 'auth',
      description:
        status === 'success' ? '用户更新资料成功' : '用户更新资料失败',
      ip,
      userAgent,
      status,
      errorMessage,
      method: 'PUT',
      url: '/api/auth/profile',
    };

    return this.create(logData);
  }

  /**
   * 查询操作日志列表
   * @param query 查询参数
   * @returns 操作日志列表和分页信息
   */
  async findAll(query: OperationLogQueryDto) {
    const {
      page = 1,
      limit = 10,
      username,
      module,
      action,
      status,
      startTime,
      endTime,
      ip,
    } = query;

    // 构建查询条件
    const filter: FilterQuery<OperationLogDocument> = {};

    if (username) {
      filter.username = { $regex: username, $options: 'i' };
    }

    if (module) {
      filter.module = module;
    }

    if (action) {
      filter.action = action;
    }

    if (status) {
      filter.status = status;
    }

    if (ip) {
      filter.ip = { $regex: ip, $options: 'i' };
    }

    if (startTime || endTime) {
      filter.createdAt = {};
      if (startTime) {
        filter.createdAt.$gte = new Date(startTime);
      }
      if (endTime) {
        filter.createdAt.$lte = new Date(endTime);
      }
    }

    // 计算跳过的记录数
    const skip = (page - 1) * limit;

    // 执行查询
    const [data, total] = await Promise.all([
      this.operationLogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.operationLogModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 根据ID查询操作日志
   * @param id 日志ID
   * @returns 操作日志详情
   */
  async findById(id: string): Promise<OperationLog> {
    const log = await this.operationLogModel.findById(id).exec();
    if (!log) {
      throw new NotFoundException('操作日志不存在');
    }
    return log;
  }

  /**
   * 根据用户ID查询操作日志
   * @param userId 用户ID
   * @param query 查询参数
   * @returns 用户操作日志列表
   */
  async findByUserId(userId: string, query: OperationLogQueryDto) {
    const enhancedQuery = { ...query, userId };
    return this.findAll(enhancedQuery);
  }

  /**
   * 获取操作日志统计信息
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @returns 统计信息
   */
  async getStatistics(startTime?: string, endTime?: string) {
    const filter: FilterQuery<OperationLogDocument> = {};

    if (startTime || endTime) {
      filter.createdAt = {};
      if (startTime) {
        filter.createdAt.$gte = new Date(startTime);
      }
      if (endTime) {
        filter.createdAt.$lte = new Date(endTime);
      }
    }

    const [
      totalLogs,
      successLogs,
      errorLogs,
      moduleStats,
      actionStats,
      userStats,
    ] = await Promise.all([
      // 总日志数
      this.operationLogModel.countDocuments(filter),

      // 成功日志数
      this.operationLogModel.countDocuments({ ...filter, status: 'success' }),

      // 失败日志数
      this.operationLogModel.countDocuments({ ...filter, status: 'error' }),

      // 按模块统计
      this.operationLogModel.aggregate<IAggregationGroup>([
        { $match: filter },
        { $group: { _id: '$module', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // 按操作统计
      this.operationLogModel.aggregate<IAggregationGroup>([
        { $match: filter },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // 按用户统计
      this.operationLogModel.aggregate<IAggregationGroup>([
        { $match: filter },
        { $group: { _id: '$username', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return {
      total: totalLogs,
      success: successLogs,
      error: errorLogs,
      successRate:
        totalLogs > 0 ? ((successLogs / totalLogs) * 100).toFixed(2) : '0.00',
      moduleStats: moduleStats.map((item) => ({
        module: item._id,
        count: item.count,
      })),
      actionStats: actionStats.map((item) => ({
        action: item._id,
        count: item.count,
      })),
      userStats: userStats.map((item) => ({
        username: item._id,
        count: item.count,
      })),
    };
  }

  /**
   * 清理过期日志
   * @param days 保留天数
   * @returns 清理结果
   */
  async cleanupOldLogs(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.operationLogModel.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    return {
      deletedCount: result.deletedCount,
      cutoffDate,
    };
  }
}
