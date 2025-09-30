import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取操作日志列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取操作日志列表成功',
    type: OperationLogListResponseDto,
  })
  async getList(
    @Body() operationLogListDto: OperationLogListDto,
  ): Promise<OperationLogListResponseDto> {
    return this.operationLogService.getList(operationLogListDto);
  }

  @Post('detail')
  @HttpCode(HttpStatus.OK)
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
    status: HttpStatus.OK,
    description: '获取操作日志详情成功',
    type: OperationLogData,
  })
  async getById(@Body('id') id: string): Promise<OperationLogData> {
    return this.operationLogService.getById(id);
  }
}
