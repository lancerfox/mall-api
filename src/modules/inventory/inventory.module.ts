import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Inventory, InventorySchema } from './entities/inventory.entity';
import { InventoryService } from './services/inventory.service';
import { InventoryController } from './controllers/inventory.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
