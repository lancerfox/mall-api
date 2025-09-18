import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { OperationLogService } from '../services/operation-log.service';
import {
  GetOperationLogsDto,
  GetUserOperationLogsDto,
} from '../dto/operation-log.dto';
import {
  OperationLogListResponseDto,
  OperationLogStatsResponseDto,
} from '../dto/operation-log-response.dto';

@ApiTags('操作日志管理')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('operation-log')
export class OperationLogController {
  constructor(private readonly operationLogService: OperationLogService) {}

  @Get('list')
  @ApiOperation({ summary: '获取操作日志列表' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: OperationLogListResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async getOperationLogs(@Query() query: GetOperationLogsDto) {
    return await this.operationLogService.getOperationLogs(query);
  }

  @Get('user-logs')
  @ApiOperation({ summary: '获取用户操作日志' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: OperationLogListResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async getUserOperationLogs(
    @Query() query: GetUserOperationLogsDto,
    @CurrentUser('sub') userId: string,
  ) {
    return await this.operationLogService.getUserOperationLogs(userId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取操作统计信息' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: OperationLogStatsResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async getOperationStats(@CurrentUser('sub') userId: string) {
    return await this.operationLogService.getOperationStats(userId);
  }
}
