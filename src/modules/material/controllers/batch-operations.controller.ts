import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { BatchOperationsService } from '../services/batch-operations.service';
import { BatchMoveCategoryDto } from '../dto/batch-operations.dto';
import { BatchMoveCategoryResponseDto } from '../dto/batch-operations-response.dto';

@ApiTags('材料管理')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('material')
export class BatchOperationsController {
  constructor(
    private readonly batchOperationsService: BatchOperationsService,
  ) {}

  @Post('batch-move-category')
  @ApiOperation({ summary: '批量移动分类' })
  @ApiResponse({
    status: 200,
    description: '批量移动完成',
    type: BatchMoveCategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '部分材料不存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async batchMoveCategory(
    @Body() batchMoveDto: BatchMoveCategoryDto,
    @CurrentUser('sub') userId: string,
  ) {
    return await this.batchOperationsService.batchMoveCategory(
      batchMoveDto,
      userId,
    );
  }
}
