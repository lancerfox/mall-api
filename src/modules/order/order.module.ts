import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './controllers';
import { OrderService } from './services';
import {
  Order,
  OrderItem,
  PaymentInfo,
  ShippingInfo,
  OrderOperationLog,
} from './entities';
import { ProductSKU } from '../product/entities/product-sku.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      PaymentInfo,
      ShippingInfo,
      OrderOperationLog,
      ProductSKU,
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
