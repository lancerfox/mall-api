import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategoryController, ProductController } from './controllers';
import { ProductCategoryService, ProductService } from './services';
import { ProductImageService } from './services/product-image.service';
import { ProductCategory } from './entities/product-category.entity';
import { ProductSPU } from './entities/product-spu.entity';
import { ProductSKU } from './entities/product-sku.entity';
import { ProductImage } from './entities/product-image.entity';
import { SupabaseService } from '../image/services/supabase.service';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductCategory,
      ProductSPU,
      ProductSKU,
      ProductImage,
    ]),
    ImageModule,
  ],
  controllers: [ProductCategoryController, ProductController],
  providers: [
    ProductCategoryService,
    ProductService,
    ProductImageService,
    SupabaseService,
  ],
  exports: [ProductCategoryService, ProductService, ProductImageService],
})
export class ProductModule {}
