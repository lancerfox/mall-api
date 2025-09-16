# NestJS商城后台管理系统错误码改进

## Core Features

- 统一错误码系统

- 分类错误码范围

- 替换HttpStatus为自定义错误码

- 模块一致性改进

## Tech Stack

{
  "错误码系统": "自定义错误码分类",
  "范围划分": "1000-1999: 通用错误, 2000-2999: 认证错误, 3000-3999: 用户错误, 4000-4999: 权限错误, 5000-5999: 业务错误",
  "框架": "NestJS HttpException"
}

## Design

分层错误码架构，便于维护和扩展

## Plan

Note: 

- [ ] is holding
- [/] is doing
- [X] is done

---

[X] 分析现有错误码使用情况

[X] 设计新的错误码分类系统

[X] 实现src/common/constants/error-codes.ts

[X] 替换用户模块中的HttpStatus

[X] 检查并替换其他模块中的HttpStatus

[X] 验证错误码系统一致性
