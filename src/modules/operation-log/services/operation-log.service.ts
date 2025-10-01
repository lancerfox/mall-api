import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { OperationLog } from '../entities/operation-log.entity';
import { CreateOperationLogDto } from '../dto/create-operation-log.dto';
import { OperationLogListDto } from '../dto/operation-log-list.dto';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { OperationType } from '../entities/operation-log.entity';
import { parseDateString } from '../../../common/utils/date-parser';

@Injectable()
export class OperationLogService {
  private readonly logger = new Logger(OperationLogService.name);

  constructor(
    @InjectRepository(OperationLog)
    private readonly operationLogRepository: Repository<OperationLog>,
  ) {}

  /**
   * 创建操作日志
   * @param createOperationLogDto 创建操作日志数据传输对象
   * @returns 创建的操作日志
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
        (error as Error).stack || (error as Error).message || String(error),
      );
      throw new BusinessException(ERROR_CODES.OPERATION_LOG_CREATE_FAILED);
    }
  }

  /**
   * 获取操作日志列表
   * @param operationLogListDto 操作日志列表查询条件
   * @returns 操作日志列表和总数
   */
  async getList(
    operationLogListDto: OperationLogListDto,
  ): Promise<{ list: OperationLog[]; total: number }> {
    const { module, operationType, username, startTime, endTime } =
      operationLogListDto;

    // 提供默认值以防止 undefined 错误
    const page = operationLogListDto.page ?? 1;
    const pageSize = operationLogListDto.pageSize ?? 10;

    const where: {
      module?: any;
      operationType?: OperationType;
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

    // 时间范围筛选
    const parsedStartTime = startTime ? parseDateString(startTime) : null;
    const parsedEndTime = endTime ? parseDateString(endTime) : null;

    if (parsedStartTime && parsedEndTime) {
      where.createdAt = Between(parsedStartTime, parsedEndTime);
    } else if (parsedStartTime) {
      // 如果只有开始时间，查找该时间之后的记录
      where.createdAt = Between(parsedStartTime, new Date());
    } else if (parsedEndTime) {
      // 如果只有结束时间，查找该时间之前的记录
      const beginningOfTime = new Date(0);
      where.createdAt = Between(beginningOfTime, parsedEndTime);
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
