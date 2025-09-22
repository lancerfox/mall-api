import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialController } from './controllers/material.controller';
import { MaterialService } from './services/material.service';
import { BatchOperationsService } from './services/batch-operations.service';
import { UploadModule } from '../upload/upload.module';
import { InventoryModule } from '../inventory/inventory.module';
import { Material, MaterialSchema } from './entities/material.entity';
import {
  MaterialImage,
  MaterialImageSchema,
} from './entities/material-image.entity';
import { Category, CategorySchema } from '../category/entities/category.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema },
      { name: MaterialImage.name, schema: MaterialImageSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    UploadModule,
    InventoryModule,
  ],
  controllers: [MaterialController],
  providers: [MaterialService, BatchOperationsService],
  exports: [MaterialService, BatchOperationsService],
})
export class MaterialModule {}
