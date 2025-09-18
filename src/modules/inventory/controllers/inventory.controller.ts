import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { InventoryService } from '../services/inventory.service';
import { InventoryListDto } from '../dto/inventory-list.dto';
import { InventoryAdjustDto } from '../dto/inventory-adjust.dto';
import { InventoryInboundDto } from '../dto/inventory-inbound.dto';
import { InventoryOutboundDto } from '../dto/inventory-outbound.dto';
import { OperationLogDto } from '../dto/operation-log.dto';
import {
  InventoryListResponseDto,
  InventoryOperationResponseDto,
  OperationLogResponseDto,
} from '../dto/inventory-response.dto';

@ApiTags('库存管理')
@Controller('v1/inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('list')
  @ApiOperation({ summary: '获取库存列表' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: InventoryListResponseDto,
  })
  async getInventoryList(
    @Query() query: InventoryListDto,
  ): Promise<InventoryListResponseDto> {
    return await this.inventoryService.getInventoryList(query);
  }

  @Post('adjust')
  @ApiOperation({ summary: '库存调整' })
  @ApiResponse({
    status: 200,
    description: '调整成功',
    type: InventoryOperationResponseDto,
  })
  async adjustInventory(
    @Body() adjustDto: InventoryAdjustDto,
    @CurrentUser('sub') userId: string,
  ): Promise<InventoryOperationResponseDto> {
    return await this.inventoryService.adjustInventory(adjustDto, userId);
  }

  @Post('inbound')
  @ApiOperation({ summary: '入库操作' })
  @ApiResponse({
    status: 200,
    description: '入库成功',
    type: InventoryOperationResponseDto,
  })
  async inboundInventory(
    @Body() inboundDto: InventoryInboundDto,
    @CurrentUser('sub') userId: string,
  ): Promise<InventoryOperationResponseDto> {
    return await this.inventoryService.inboundInventory(inboundDto, userId);
  }

  @Post('outbound')
  @ApiOperation({ summary: '出库操作' })
  @ApiResponse({
    status: 200,
    description: '出库成功',
    type: InventoryOperationResponseDto,
  })
  async outboundInventory(
    @Body() outboundDto: InventoryOutboundDto,
    @CurrentUser('sub') userId: string,
  ): Promise<InventoryOperationResponseDto> {
    return await this.inventoryService.outboundInventory(outboundDto, userId);
  }

  @Get('operation-list')
  @ApiOperation({ summary: '获取出入库记录列表' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: OperationLogResponseDto,
  })
  async getOperationLog(
    @Query() query: OperationLogDto,
  ): Promise<OperationLogResponseDto> {
    return await this.inventoryService.getOperationLog(query);
  }
}
