import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { OperationLogService } from '../services/operation-log.service';
import { OperationLogListDto } from '../dto/operation-log-list.dto';
import {
  OperationLogResponseDto,
  OperationLogListResponseDto,
  OperationLogData,
} from '../dto/operation-log-response.dto';

@ApiTags('操作日志')
@Controller('operation-log')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OperationLogController {
  constructor(private readonly operationLogService: OperationLogService) {}

  @Post('list')
  @ApiOperation({ summary: '获取操作日志列表' })
  @ApiBody({ type: OperationLogListDto })
  @ApiResponse({
    status: 200,
    description: '获取操作日志列表成功',
    type: OperationLogListResponseDto,
  })
  async getList(
    @Body() operationLogListDto: OperationLogListDto,
  ): Promise<OperationLogListResponseDto> {
    const result = await this.operationLogService.getList(operationLogListDto);
    return {
      code: result.code,
      message: result.message,
      data: result.data
        ? {
            items: result.data.items as OperationLogData[],
            total: result.data.total,
          }
        : { items: [], total: 0 },
    };
  }

  @Post('detail')
  @ApiOperation({ summary: '获取操作日志详情' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '日志ID' },
      },
      required: ['id'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '获取操作日志详情成功',
    type: OperationLogResponseDto,
  })
  async getById(@Body('id') id: string): Promise<OperationLogResponseDto> {
    const result = await this.operationLogService.getById(id);
    return {
      code: result.code,
      message: result.message,
      data: result.data as OperationLogData,
    };
  }
}
