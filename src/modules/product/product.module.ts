import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductCategoryController, ProductController } from './controllers';
import { ProductCategoryService, ProductService } from './services';
import {
  ProductCategory,
  ProductCategorySchema,
} from './entities/product-category.entity';
import { ProductSPU, ProductSPUSchema } from './entities/product-spu.entity';
import { ProductSKU, ProductSKUSchema } from './entities/product-sku.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductCategory.name, schema: ProductCategorySchema },
      { name: ProductSPU.name, schema: ProductSPUSchema },
      { name: ProductSKU.name, schema: ProductSKUSchema },
    ]),
  ],
  controllers: [ProductCategoryController, ProductController],
  providers: [ProductCategoryService, ProductService],
  exports: [ProductCategoryService, ProductService],
})
export class ProductModule {}
