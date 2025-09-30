import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import type { JwtUser } from '../../../common/decorators/user.decorator';
import { IApiResponse } from '../../../common/types/api-response.interface';
import {
  ERROR_CODES,
  ERROR_MESSAGES,
} from '../../../common/constants/error-codes';
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
  OrderStatusDictionaryResponseDto,
} from '../dto';

@ApiTags('订单管理')
@Controller('api/orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('list')
  @ApiOperation({ summary: '获取订单列表' })
  @ApiResponse({
    status: 200,
    description: '获取订单列表成功',
    type: OrderListResponseDto,
  })
  async getOrderList(
    @Query() query: OrderListQueryDto,
  ): Promise<IApiResponse<any>> {
    try {
      const result = await this.orderService.getOrderList(query);
      return {
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: result,
      };
    } catch (error) {
      return {
        code: ERROR_CODES.VALIDATION_FAILED,
        message:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES[ERROR_CODES.VALIDATION_FAILED],
        data: null,
      };
    }
  }

  @Get('detail')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiResponse({
    status: 200,
    description: '获取订单详情成功',
    type: OrderDetailResponseDto,
  })
  async getOrderDetail(
    @Query() query: OrderDetailQueryDto,
  ): Promise<IApiResponse<OrderDetailResponseDto>> {
    try {
      const result = await this.orderService.getOrderDetail(query);
      return {
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: result,
      };
    } catch (error) {
      const isNotFoundError =
        error instanceof Error &&
        'status' in error &&
        (error as Error & { status?: number }).status === 404;
      const code = (
        isNotFoundError
          ? ERROR_CODES.ORDER_NOT_FOUND
          : ERROR_CODES.VALIDATION_FAILED
      ) as number;
      return {
        code,
        message:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES[ERROR_CODES.VALIDATION_FAILED],
        data: null,
      };
    }
  }

  @Post('ship')
  @ApiOperation({ summary: '订单发货' })
  @ApiResponse({
    status: 200,
    description: '订单发货成功',
    type: OrderShipResponseDto,
  })
  async shipOrder(
    @Body() dto: OrderShipDto,
    @CurrentUser() user: JwtUser,
  ): Promise<IApiResponse<OrderShipResponseDto>> {
    try {
      const operatorName = user?.username || '系统';
      const result = await this.orderService.shipOrder(dto, operatorName);
      return {
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: result,
      };
    } catch (error) {
      const isNotFoundError =
        error instanceof Error &&
        'status' in error &&
        (error as Error & { status?: number }).status === 404;
      const code = (
        isNotFoundError
          ? ERROR_CODES.ORDER_NOT_FOUND
          : ERROR_CODES.VALIDATION_FAILED
      ) as number;
      return {
        code,
        message:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES[ERROR_CODES.VALIDATION_FAILED],
        data: null,
      };
    }
  }

  @Post('close')
  @ApiOperation({ summary: '关闭订单' })
  @ApiResponse({
    status: 200,
    description: '关闭订单成功',
    type: OrderCloseResponseDto,
  })
  async closeOrder(
    @Body() dto: OrderCloseDto,
    @CurrentUser() user: JwtUser,
  ): Promise<IApiResponse<OrderCloseResponseDto>> {
    try {
      const operatorName = user?.username || '系统';
      const result = await this.orderService.closeOrder(dto, operatorName);
      return {
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: result,
      };
    } catch (error) {
      const isNotFoundError =
        error instanceof Error &&
        'status' in error &&
        (error as Error & { status?: number }).status === 404;
      const code = (
        isNotFoundError
          ? ERROR_CODES.ORDER_NOT_FOUND
          : ERROR_CODES.VALIDATION_FAILED
      ) as number;
      return {
        code,
        message:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES[ERROR_CODES.VALIDATION_FAILED],
        data: null,
      };
    }
  }

  @Post('modify_address')
  @ApiOperation({ summary: '修改订单地址' })
  @ApiResponse({
    status: 200,
    description: '修改订单地址成功',
    type: OrderModifyAddressResponseDto,
  })
  async modifyOrderAddress(
    @Body() dto: OrderModifyAddressDto,
    @CurrentUser() user: JwtUser,
  ): Promise<IApiResponse<OrderModifyAddressResponseDto>> {
    try {
      const operatorName = user?.username || '系统';
      const result = await this.orderService.modifyOrderAddress(
        dto,
        operatorName,
      );
      return {
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: result,
      };
    } catch (error) {
      const isNotFoundError =
        error instanceof Error &&
        'status' in error &&
        (error as Error & { status?: number }).status === 404;
      const code = (
        isNotFoundError
          ? ERROR_CODES.ORDER_NOT_FOUND
          : ERROR_CODES.VALIDATION_FAILED
      ) as number;
      return {
        code,
        message:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES[ERROR_CODES.VALIDATION_FAILED],
        data: null,
      };
    }
  }

  @Get('status-dictionary')
  @ApiOperation({ summary: '获取订单状态字典' })
  @ApiResponse({
    status: 200,
    description: '获取订单状态字典成功',
    type: OrderStatusDictionaryResponseDto,
  })
  async getOrderStatusDictionary(): Promise<IApiResponse<any>> {
    try {
      const result = await this.orderService.getOrderStatusDictionary();
      return {
        code: ERROR_CODES.SUCCESS,
        message: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
        data: result.data,
      };
    } catch (error) {
      return {
        code: ERROR_CODES.VALIDATION_FAILED,
        message:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES[ERROR_CODES.VALIDATION_FAILED],
        data: null,
      };
    }
  }
}
