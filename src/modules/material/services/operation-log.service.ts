import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  OperationLog,
  OperationLogDocument,
  OperationType,
} from '../entities/operation-log.entity';
import {
  GetOperationLogsDto,
  GetUserOperationLogsDto,
} from '../dto/operation-log.dto';

@Injectable()
export class OperationLogService {
  constructor(
    @InjectModel(OperationLog.name)
    private operationLogModel: Model<OperationLogDocument>,
  ) {}

  /**
   * 创建操作日志
   */
  async createOperationLog(
    operationType: OperationType,
    userId: string,
    description: string,
    materialId?: string,

    beforeData?: any,

    afterData?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<OperationLog> {
    const operationLog = new this.operationLogModel({
      operationType,
      userId,
      materialId,
      description,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      beforeData,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      afterData,
      ipAddress,
      userAgent,
      operationTime: new Date(),
    });

    return await operationLog.save();
  }

  /**
   * 获取操作日志列表
   */
  async getOperationLogs(query: GetOperationLogsDto) {
    const {
      page = 1,
      limit = 10,
      operationType,
      userId,
      materialId,
      startDate,
      endDate,
      keyword,
    } = query;

    const filter: any = {};

    if (operationType) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.operationType = operationType;
    }

    if (userId) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.userId = userId;
    }

    if (materialId) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.materialId = materialId;
    }

    if (startDate || endDate) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.operationTime = {};
      if (startDate) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.operationTime.$gte = new Date(startDate);
      }
      if (endDate) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.operationTime.$lte = new Date(endDate);
      }
    }

    if (keyword) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.$or = [
        { description: { $regex: keyword, $options: 'i' } },
        { 'afterData.name': { $regex: keyword, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.operationLogModel
        .find(filter)
        .sort({ operationTime: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username')
        .populate('materialId', 'name')
        .lean()
        .exec(),
      this.operationLogModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const formattedItems = items.map((item: any) => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      id: item._id.toString(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      operationType: item.operationType,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      userId: item.userId?._id?.toString() || item.userId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      username: item.userId?.username || '未知用户',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      materialId: item.materialId?._id?.toString() || item.materialId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      materialName: item.materialId?.name || '',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      description: item.description,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      beforeData: item.beforeData,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      afterData: item.afterData,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      ipAddress: item.ipAddress,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      userAgent: item.userAgent,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      operationTime: item.operationTime,
    }));

    return {
      code: 200,
      message: '获取操作日志列表成功',
      data: {
        items: formattedItems,
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * 获取用户操作日志
   */
  async getUserOperationLogs(userId: string, query: GetUserOperationLogsDto) {
    const {
      page = 1,
      limit = 10,
      operationType,
      materialId,
      startDate,
      endDate,
    } = query;

    const filter: any = { userId };

    if (operationType) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.operationType = operationType;
    }

    if (materialId) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.materialId = materialId;
    }

    if (startDate || endDate) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filter.operationTime = {};
      if (startDate) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.operationTime.$gte = new Date(startDate);
      }
      if (endDate) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filter.operationTime.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.operationLogModel
        .find(filter)
        .sort({ operationTime: -1 })
        .skip(skip)
        .limit(limit)
        .populate('materialId', 'name')
        .lean()
        .exec(),
      this.operationLogModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const formattedItems = items.map((item: any) => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      id: item._id.toString(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      operationType: item.operationType,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      userId: item.userId.toString(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      materialId: item.materialId?._id?.toString() || item.materialId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      materialName: item.materialId?.name || '',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      description: item.description,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      beforeData: item.beforeData,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      afterData: item.afterData,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      ipAddress: item.ipAddress,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      userAgent: item.userAgent,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      operationTime: item.operationTime,
    }));

    return {
      code: 200,
      message: '获取用户操作日志成功',
      data: {
        items: formattedItems,
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * 获取操作统计信息
   */
  async getOperationStats(userId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 总操作次数
    const totalOperations = await this.operationLogModel.countDocuments({
      userId,
    });

    // 今日操作次数
    const todayOperations = await this.operationLogModel.countDocuments({
      userId,
      operationTime: { $gte: today },
    });

    // 本周操作次数
    const weekOperations = await this.operationLogModel.countDocuments({
      userId,
      operationTime: { $gte: weekStart },
    });

    // 本月操作次数
    const monthOperations = await this.operationLogModel.countDocuments({
      userId,
      operationTime: { $gte: monthStart },
    });

    // 操作类型统计
    const operationTypeStats = await this.operationLogModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$operationType',
          count: { $sum: 1 },
          lastOperationTime: { $max: '$operationTime' },
        },
      },
      {
        $project: {
          operationType: '$_id',
          count: 1,
          lastOperationTime: 1,
          _id: 0,
        },
      },
    ]);

    // 最近7天每日操作统计
    const dailyStatsArray = await this.operationLogModel.aggregate([
      {
        $match: {
          userId,
          operationTime: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$operationTime',
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const dailyStats: Record<string, number> = {};

    dailyStatsArray.forEach((item: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      dailyStats[item._id] = item.count;
    });

    return {
      code: 200,
      message: '获取操作统计成功',
      data: {
        totalOperations,
        todayOperations,
        weekOperations,
        monthOperations,
        operationTypeStats,
        dailyStats,
      },
    };
  }

  /**
   * 删除过期日志（可用于定时清理）
   */
  async deleteExpiredLogs(daysToKeep: number = 90): Promise<number> {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() - daysToKeep);

    const result = await this.operationLogModel.deleteMany({
      operationTime: { $lt: expireDate },
    });

    return result.deletedCount || 0;
  }
}
