import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryController } from './controllers/category.controller';
import { CategoryService } from './services/category.service';
import { Category, CategorySchema } from './entities/category.entity';
import { Material, MaterialSchema } from '../material/entities/material.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Material.name, schema: MaterialSchema },
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
