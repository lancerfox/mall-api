import { OrderStatus } from '../../../common/enums/order-status.enum';

/**
 * 订单查询条件接口
 */
export interface IOrderQueryConditions {
  orderNumber?: string;
  receiverInfo?: string;
  status?: OrderStatus;
  startTime?: Date;
  endTime?: Date;
}

/**
 * 订单状态字典项接口
 */
export interface IOrderStatusDictionaryItem {
  value: string;
  label: string;
  description: string;
}

/**
 * 物流轨迹详情接口
 */
export interface ITrackingDetail {
  time: string;
  status: string;
  location?: string;
}

/**
 * 订单操作日志接口
 */
export interface IOrderOperationLog {
  operator: string;
  action: string;
  time: string;
  description?: string;
}
