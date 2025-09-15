import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialController } from './controllers/material.controller';
import { MaterialService } from './services/material.service';
import { Material, MaterialSchema } from './entities/material.entity';
import { Category, CategorySchema } from '../category/entities/category.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService],
})
export class MaterialModule {}
