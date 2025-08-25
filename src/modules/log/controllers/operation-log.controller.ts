import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { OperationLogService } from '../services/operation-log.service';
import {
  OperationLogQueryDto,
  OperationLogResponseDto,
} from '../dto/operation-log-response.dto';

@ApiTags('操作日志管理')
@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OperationLogController {
  constructor(private readonly operationLogService: OperationLogService) {}

  @Get('operations')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: '获取操作日志列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取操作日志列表成功',
    type: [OperationLogResponseDto],
  })
  @HttpCode(HttpStatus.OK)
  async getOperationLogs(@Query() query: OperationLogQueryDto) {
    return this.operationLogService.findAll(query);
  }

  @Get('operations/:id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: '获取操作日志详情' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取操作日志详情成功',
    type: OperationLogResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async getOperationLogById(@Param('id') id: string) {
    return this.operationLogService.findById(id);
  }

  @Get('operations/user/:userId')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: '获取用户操作日志' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取用户操作日志成功',
    type: [OperationLogResponseDto],
  })
  @HttpCode(HttpStatus.OK)
  async getUserOperationLogs(
    @Param('userId') userId: string,
    @Query() query: OperationLogQueryDto,
  ) {
    return this.operationLogService.findByUserId(userId, query);
  }

  @Get('statistics')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: '获取操作日志统计信息' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取操作日志统计信息成功',
  })
  @HttpCode(HttpStatus.OK)
  async getLogStatistics(
    @Query() query: { startTime?: string; endTime?: string },
  ) {
    return this.operationLogService.getStatistics(
      query.startTime,
      query.endTime,
    );
  }
}
