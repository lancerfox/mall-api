/**
 * 订单状态枚举
 */
export enum OrderStatus {
  /** 待付款 - 用户已提交订单，但尚未完成支付 */
  PENDING_PAYMENT = 'PENDING_PAYMENT',

  /** 待发货 - 用户已完成支付，等待商家打包发货 */
  TO_BE_SHIPPED = 'TO_BE_SHIPPED',

  /** 已发货 - 商家已将商品交付物流，正在配送中 */
  SHIPPED = 'SHIPPED',

  /** 已完成 - 用户已确认收货，或系统超时自动确认 */
  COMPLETED = 'COMPLETED',

  /** 已关闭 - 订单因超时未支付、用户取消或全额退款而关闭 */
  CLOSED = 'CLOSED',

  /** 售后处理中 - 用户申请退/换货，等待商家处理 */
  AFTER_SALES = 'AFTER_SALES',
}

/**
 * 订单关闭原因枚举
 */
export enum OrderCloseReason {
  /** 超时未支付 - 订单超过支付时限自动关闭 */
  TIMEOUT_UNPAID = 'TIMEOUT_UNPAID',

  /** 用户主动取消 - 用户主动取消订单 */
  USER_CANCELLED = 'USER_CANCELLED',

  /** 疑似欺诈 - 系统检测到订单存在欺诈风险 */
  FRAUD_SUSPECTED = 'FRAUD_SUSPECTED',

  /** 库存不足 - 商品库存不足无法发货 */
  OUT_OF_STOCK = 'OUT_OF_STOCK',

  /** 其他原因 - 其他未分类的关闭原因 */
  OTHER_REASON = 'OTHER_REASON',
}

/**
 * 支付方式枚举
 */
export enum PaymentMethod {
  /** 微信支付 */
  WECHAT_PAY = 'WECHAT_PAY',

  /** 支付宝 */
  ALIPAY = 'ALIPAY',

  /** 银行卡支付 */
  BANK_CARD = 'BANK_CARD',

  /** 余额支付 */
  BALANCE = 'BALANCE',
}

/**
 * 支付状态枚举
 */
export enum PaymentStatus {
  /** 待支付 */
  PENDING = 'PENDING',

  /** 已支付 */
  PAID = 'PAID',

  /** 支付失败 */
  FAILED = 'FAILED',

  /** 已退款 */
  REFUNDED = 'REFUNDED',
}
