import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { ERROR_CODES } from 'src/common/constants/error-codes';
import { Repository, Like, Between } from 'typeorm';
import { OperationLog } from '../entities/operation-log.entity';
import { CreateOperationLogDto } from '../dto/create-operation-log.dto';
import { OperationLogListDto } from '../dto/operation-log-list.dto';

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
      this.logger.error('创建操作日志失败', error.stack || error.message);
      throw error;
    }
  }

  /**
   * 获取操作日志列表
   * @param operationLogListDto 查询条件
   * @returns 操作日志列表和总数
   */
  async getList(
    operationLogListDto: OperationLogListDto,
  ): Promise<{ list: OperationLog[]; total: number }> {
    const {
      page,
      pageSize,
      module,
      operationType,
      username,
      startTime,
      endTime,
    } = operationLogListDto;

    const where: any = {};

    if (module) {
      where.module = Like(`%${module}%`);
    }
    if (operationType) {
      where.operationType = operationType;
    }
    if (username) {
      where.username = Like(`%${username}%`);
    }
    if (startTime && endTime) {
      where.createdAt = Between(new Date(startTime), new Date(endTime));
    } else if (startTime) {
      where.createdAt = Between(new Date(startTime), new Date());
    } else if (endTime) {
      where.createdAt = Between(new Date(0), new Date(endTime));
    }

    const [list, total] = await this.operationLogRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  /**
   * 根据ID获取操作日志详情
   * @param id 日志ID
   * @returns 操作日志详情
   */
  async getById(id: string): Promise<OperationLog> {
    const operationLog = await this.operationLogRepository.findOne({
      where: { id },
    });

    if (!operationLog) {
      throw new BusinessException(ERROR_CODES.OPERATION_LOG_NOT_FOUND);
    }

    return operationLog;
  }
}
