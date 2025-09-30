import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { OperationLog } from '../entities/operation-log.entity';
import { CreateOperationLogDto } from '../dto/create-operation-log.dto';
import { OperationLogListDto } from '../dto/operation-log-list.dto';
import { IApiResponse } from '../../../common/types/api-response.interface';
import {
  ERROR_CODES,
  ERROR_MESSAGES,
} from '../../../common/constants/error-codes';

@Injectable()
export class OperationLogService {
  private readonly logger = new Logger(OperationLogService.name);

  constructor(
    @InjectRepository(OperationLog)
    private readonly operationLogRepository: Repository<OperationLog>,
  ) {}

  /**
   * 创建操作日志
   * @param createOperationLogDto 创建操作日志DTO
   * @returns 操作日志实体
   */
  async create(
    createOperationLogDto: CreateOperationLogDto,
  ): Promise<OperationLog> {
    try {
      const operationLog = this.operationLogRepository.create(
        createOperationLogDto,
      );
      return await this.operationLogRepository.save(operationLog);
    } catch (error: any) {
      this.logger.error(
        '创建操作日志失败',
        (error as Error).stack || (error as Error).message,
      );
      throw error;
    }
  }

  /**
   * 获取操作日志列表
   * @param operationLogListDto 查询条件
   * @returns 操作日志列表
   */
  async getList(
    operationLogListDto: OperationLogListDto,
  ): Promise<IApiResponse<{ list: OperationLog[]; total: number }>> {
    try {
      const {
        page,
        pageSize,
        module,
        operationType,
        username,
        startTime,
        endTime,
      } = operationLogListDto;

      // 构建查询条件
      const where: {
        module?: any;
        operationType?: any;
        username?: any;
        createdAt?: any;
      } = {};

      if (module) {
        where.module = Like(`%${module}%`);
      }

      if (operationType) {
        where.operationType = operationType;
      }

      if (username) {
        where.username = Like(`%${username}%`);
      }

      // 时间范围查询
      if (startTime || endTime) {
        const createdAt: Record<string, Date> = {};
        if (startTime) {
          createdAt._gte = new Date(startTime);
        }
        if (endTime) {
          createdAt._lte = new Date(endTime);
        }
        where.createdAt = createdAt;
      }

      // 查询数据
      const [list, total] = await this.operationLogRepository.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      return {
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: {
          list,
          total,
        },
      };
    } catch (error: any) {
      this.logger.error(
        '获取操作日志列表失败',
        (error as Error).stack || (error as Error).message,
      );
      throw error;
    }
  }

  /**
   * 根据ID获取操作日志详情
   * @param id 日志ID
   * @returns 操作日志详情
   */
  async getById(id: string): Promise<IApiResponse<OperationLog>> {
    try {
      const operationLog = await this.operationLogRepository.findOne({
        where: { id },
      });

      if (!operationLog) {
        return {
          code: ERROR_CODES.OPERATION_LOG_NOT_FOUND,
          message: '操作日志不存在',
          data: null,
        };
      }

      return {
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: operationLog,
      };
    } catch (error: any) {
      this.logger.error(
        '获取操作日志详情失败',
        (error as Error).stack || (error as Error).message,
      );
      throw error;
    }
  }
}
