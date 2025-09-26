import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategoryController, ProductController } from './controllers';
import { ProductCategoryService, ProductService } from './services';
import { ProductCategory } from './entities/product-category.entity';
import { ProductSPU } from './entities/product-spu.entity';
import { ProductSKU } from './entities/product-sku.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductCategory, ProductSPU, ProductSKU]),
  ],
  controllers: [ProductCategoryController, ProductController],
  providers: [ProductCategoryService, ProductService],
  exports: [ProductCategoryService, ProductService],
})
export class ProductModule {}
