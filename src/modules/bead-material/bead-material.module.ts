import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';
import { MaterialsController } from './materials/materials.controller';
import { MaterialsService } from './materials/materials.service';
import { CategorySchema } from './categories/schemas/category.schema';
import { MaterialSchema } from './materials/schemas/material.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BeadCategory', schema: CategorySchema },
      { name: 'BeadMaterial', schema: MaterialSchema },
    ]),
  ],
  controllers: [CategoriesController, MaterialsController],
  providers: [CategoriesService, MaterialsService],
  exports: [CategoriesService, MaterialsService],
})
export class BeadMaterialModule {}
