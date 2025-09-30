import {
  Controller,
  Get,
  Post,
  Query,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import type { JwtUser } from '../../../common/decorators/user.decorator';
import { OrderService } from '../services/order.service';
import {
  OrderListQueryDto,
  OrderDetailQueryDto,
  OrderShipDto,
  OrderCloseDto,
  OrderModifyAddressDto,
  OrderListResponseDto,
  OrderDetailResponseDto,
  OrderShipResponseDto,
  OrderCloseResponseDto,
  OrderModifyAddressResponseDto,
  OrderStatusDictionaryItemDto,
} from '../dto';

@ApiTags('订单管理')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('list')
  @ApiOperation({ summary: '获取订单列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取订单列表成功',
    type: OrderListResponseDto,
  })
  async getOrderList(
    @Query() query: OrderListQueryDto,
  ): Promise<OrderListResponseDto> {
    return this.orderService.getOrderList(query);
  }

  @Get('detail')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取订单详情成功',
    type: OrderDetailResponseDto,
  })
  async getOrderDetail(
    @Query() query: OrderDetailQueryDto,
  ): Promise<OrderDetailResponseDto> {
    return this.orderService.getOrderDetail(query);
  }

  @Post('ship')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '订单发货' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '订单发货成功',
    type: OrderShipResponseDto,
  })
  async shipOrder(
    @Body() dto: OrderShipDto,
    @CurrentUser() user: JwtUser,
  ): Promise<OrderShipResponseDto> {
    const operatorName = user?.username || '系统';
    return this.orderService.shipOrder(dto, operatorName);
  }

  @Post('close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '关闭订单' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '关闭订单成功',
    type: OrderCloseResponseDto,
  })
  async closeOrder(
    @Body() dto: OrderCloseDto,
    @CurrentUser() user: JwtUser,
  ): Promise<OrderCloseResponseDto> {
    const operatorName = user?.username || '系统';
    return this.orderService.closeOrder(dto, operatorName);
  }

  @Post('modify_address')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '修改订单地址' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '修改订单地址成功',
    type: OrderModifyAddressResponseDto,
  })
  async modifyOrderAddress(
    @Body() dto: OrderModifyAddressDto,
    @CurrentUser() user: JwtUser,
  ): Promise<OrderModifyAddressResponseDto> {
    const operatorName = user?.username || '系统';
    return this.orderService.modifyOrderAddress(dto, operatorName);
  }

  @Get('status-dictionary')
  @ApiOperation({ summary: '获取订单状态字典' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取订单状态字典成功',
    type: [OrderStatusDictionaryItemDto],
  })
  getOrderStatusDictionary(): OrderStatusDictionaryItemDto[] {
    return this.orderService.getOrderStatusDictionary();
  }
}
