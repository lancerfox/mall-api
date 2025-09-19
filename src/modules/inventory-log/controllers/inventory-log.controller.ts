import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InventoryLogService } from '../services/inventory-log.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { InventoryLogListDto } from '../dto/inventory-log-list.dto';
import { InventoryLogListResponseDto } from '../dto/inventory-log-response.dto';

@ApiTags('库存操作记录')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('inventory-logs')
export class InventoryLogController {
  constructor(private readonly inventoryLogService: InventoryLogService) {}

  @Get('list')
  @ApiOperation({ summary: '获取操作记录列表' })
  @ApiResponse({ status: 200, type: InventoryLogListResponseDto })
  async list(@Query() query: InventoryLogListDto) {
    return this.inventoryLogService.findAll(query);
  }
}
