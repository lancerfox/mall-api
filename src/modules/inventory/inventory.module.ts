import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryService } from './services/inventory.service';
import {
  InventoryRecord,
  InventoryRecordSchema,
} from './entities/inventory-record.entity';
import {
  InventoryOperation,
  InventoryOperationSchema,
} from './entities/inventory-operation.entity';
import { Material, MaterialSchema } from '../material/entities/material.entity';
import { Category, CategorySchema } from '../category/entities/category.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InventoryRecord.name, schema: InventoryRecordSchema },
      { name: InventoryOperation.name, schema: InventoryOperationSchema },
      { name: Material.name, schema: MaterialSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
