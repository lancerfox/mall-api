import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InventoryLogService } from '../services/inventory-log.service';

@ApiTags('库存操作记录')
@Controller('api/v1/inventory-logs')
export class InventoryLogController {
  constructor(private readonly inventoryLogService: InventoryLogService) {}
}
