import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  InventoryLog,
  InventoryLogSchema,
} from './entities/inventory-log.entity';
import { InventoryLogService } from './services/inventory-log.service';
import { InventoryLogController } from './controllers/inventory-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InventoryLog.name, schema: InventoryLogSchema },
    ]),
  ],
  controllers: [InventoryLogController],
  providers: [InventoryLogService],
  exports: [InventoryLogService],
})
export class InventoryLogModule {}
