import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InventoryService } from '../services/inventory.service';

@ApiTags('库存管理')
@Controller('api/v1/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}
}
