# 订单管理模块 API 文档

## 概述

订单管理模块提供完整的电商订单生命周期管理功能，包括订单查询、状态管理、发货处理、关闭操作等核心业务流程。

## 接口列表

### 1. 订单列表查询

**接口路径**: `GET /api/orders/list`

**功能描述**: 获取订单列表，支持多条件筛选和分页

**请求参数**:
- `order_number` (string, 可选): 订单编号精确搜索
- `receiver_info` (string, 可选): 收货人姓名或手机号模糊搜索
- `status` (string, 可选): 订单状态筛选
- `start_time` (string, 可选): 下单时间范围-开始时间
- `end_time` (string, 可选): 下单时间范围-结束时间
- `page` (number, 可选): 页码，默认为1
- `size` (number, 可选): 每页数量，默认为10

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "items": [
      {
        "id": "1",
        "order_number": "ORD202509290001",
        "customer_name": "张三",
        "customer_phone": "13800138000",
        "total_amount": 129.90,
        "status": "TO_BE_SHIPPED",
        "created_at": "2025-09-29T10:30:00.000Z",
        "product_info": [
          {
            "product_image": "https://example.com/product1.jpg",
            "product_name": "商品A",
            "sku_spec": "规格：XL 颜色：红色",
            "quantity": 1
          }
        ]
      }
    ],
    "total": 100,
    "current_page": 1,
    "page_size": 10
  }
}
```

### 2. 订单详情查询

**接口路径**: `GET /api/orders/detail`

**功能描述**: 获取订单详细信息

**请求参数**:
- `id` (string, 必填): 订单ID

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": "1",
    "order_number": "ORD202509290001",
    "status": "TO_BE_SHIPPED",
    "created_at": "2025-09-29T10:30:00.000Z",
    "paid_at": "2025-09-29T10:45:00.000Z",
    "shipped_at": null,
    "customer_info": {
      "name": "张三",
      "phone": "13800138000",
      "address": "北京市朝阳区xxx街道xxx号"
    },
    "items": [
      {
        "product_image": "https://example.com/product1.jpg",
        "product_name": "商品A",
        "sku_spec": "规格：XL 颜色：红色",
        "price": 129.90,
        "quantity": 1,
        "subtotal": 129.90
      }
    ],
    "payment_info": {
      "method": "微信支付",
      "transaction_id": "WX202509290001",
      "status": "已支付"
    },
    "shipping_info": {
      "company": "顺丰快递",
      "tracking_number": "SF1234567890",
      "tracking_details": [
        {
          "time": "2025-09-29T15:00:00.000Z",
          "status": "已揽收"
        }
      ]
    },
    "remark": "用户要求优先发货",
    "operation_log": [
      {
        "operator": "管理员A",
        "action": "将订单标记为已发货",
        "time": "2025-09-29T15:30:00.000Z"
      }
    ]
  }
}
```

### 3. 订单发货

**接口路径**: `POST /api/orders/ship`

**功能描述**: 处理订单发货业务

**请求参数**:
- `id` (string, 必填): 订单ID
- `shipping_company` (string, 必填): 物流公司名称
- `tracking_number` (string, 必填): 物流单号

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": "1",
    "order_number": "ORD202509290001",
    "status": "SHIPPED",
    "shipped_at": "2025-09-29T16:00:00.000Z"
  }
}
```

### 4. 关闭订单

**接口路径**: `POST /api/orders/close`

**功能描述**: 处理订单关闭业务

**请求参数**:
- `id` (string, 必填): 订单ID
- `close_reason` (string, 必填): 关闭原因
- `close_remark` (string, 可选): 关闭备注

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": "1",
    "order_number": "ORD202509290001",
    "status": "CLOSED",
    "close_reason": "TIMEOUT_UNPAID",
    "close_remark": "订单超时未支付自动关闭"
  }
}
```

### 5. 修改订单地址

**接口路径**: `POST /api/orders/modify_address`

**功能描述**: 修改订单收货地址

**请求参数**:
- `id` (string, 必填): 订单ID
- `name` (string, 必填): 收货人姓名
- `phone` (string, 必填): 收货人电话
- `address` (string, 必填): 详细收货地址

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": "1",
    "order_number": "ORD202509290001",
    "customer_info": {
      "name": "张三",
      "phone": "13800138000",
      "address": "北京市海淀区xxx街道xxx号"
    }
  }
}
```

### 6. 订单状态字典

**接口路径**: `GET /api/orders/status-dictionary`

**功能描述**: 获取订单状态枚举值与中文描述的映射关系

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "value": "PENDING_PAYMENT",
      "label": "待付款",
      "description": "用户已提交订单，但尚未完成支付"
    },
    {
      "value": "TO_BE_SHIPPED",
      "label": "待发货",
      "description": "用户已完成支付，等待商家打包发货"
    },
    {
      "value": "SHIPPED",
      "label": "已发货",
      "description": "商家已将商品交付物流，正在配送中"
    },
    {
      "value": "COMPLETED",
      "label": "已完成",
      "description": "用户已确认收货，或系统超时自动确认"
    },
    {
      "value": "CLOSED",
      "label": "已关闭",
      "description": "订单因超时未支付、用户取消或全额退款而关闭"
    },
    {
      "value": "AFTER_SALES",
      "label": "售后处理中",
      "description": "用户申请退/换货，等待商家处理"
    }
  ]
}
```

## 订单状态流转规则

1. **PENDING_PAYMENT** (待付款) → **TO_BE_SHIPPED** (待发货) → **SHIPPED** (已发货) → **COMPLETED** (已完成)
2. **PENDING_PAYMENT** (待付款) → **CLOSED** (已关闭)
3. **SHIPPED** (已发货) → **AFTER_SALES** (售后处理中)

## 业务规则

1. 只有状态为 `TO_BE_SHIPPED` 的订单才能执行发货操作
2. 只有状态为 `PENDING_PAYMENT` 的订单才能执行关闭操作
3. 只有状态为 `TO_BE_SHIPPED` 的订单才能修改收货地址
4. 关闭订单时会自动释放占用的商品库存
5. 所有状态变更都会记录操作日志

## 错误码说明

- `10000`: 订单不存在
- `10001`: 订单状态无效
- `10002`: 订单无法发货
- `10003`: 订单无法关闭
- `10004`: 订单无法修改地址
- `10005`: 商品库存不足