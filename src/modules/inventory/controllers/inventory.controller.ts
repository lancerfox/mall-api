import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InventoryService } from '../services/inventory.service';
import { InventoryListDto } from '../dto/inventory-list.dto';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { ShelveInventoryDto } from '../dto/shelve-inventory.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { InventoryListResponseDto } from '../dto/inventory-response.dto';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@ApiTags('库存管理')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('list')
  @ApiOperation({ summary: '获取库存列表' })
  @ApiResponse({ status: 200, type: InventoryListResponseDto })
  async list(@Query() query: InventoryListDto) {
    return this.inventoryService.findAll(query);
  }

  @Post('update')
  @ApiOperation({ summary: '修改库存和价格' })
  @ApiResponse({ status: 200, type: SuccessResponseDto })
  async update(@Body() dto: UpdateInventoryDto, @CurrentUser() user: any) {
    return this.inventoryService.update(dto, {
      id: user.id || user.sub,
      username: user.username,
    });
  }

  @Post('shelve')
  @ApiOperation({ summary: '上架' })
  @ApiResponse({ status: 200, type: SuccessResponseDto })
  async shelve(@Body() dto: ShelveInventoryDto) {
    return this.inventoryService.shelve(dto.inventoryIds);
  }

  @Post('unshelve')
  @ApiOperation({ summary: '下架' })
  @ApiResponse({ status: 200, type: SuccessResponseDto })
  async unshelve(@Body() dto: ShelveInventoryDto) {
    return this.inventoryService.unshelve(dto.inventoryIds);
  }
}
