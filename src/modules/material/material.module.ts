import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialController } from './controllers/material.controller';
import { AdvancedSearchController } from './controllers/advanced-search.controller';
import { BatchOperationsController } from './controllers/batch-operations.controller';
import { EnhancedMaterialController } from './controllers/enhanced-material.controller';
import { SearchConditionController } from './controllers/advanced-search.controller';
import { MaterialService } from './services/material.service';
import { AdvancedSearchService } from './services/advanced-search.service';
import { BatchOperationsService } from './services/batch-operations.service';
import { EnhancedMaterialService } from './services/enhanced-material.service';
import { Material, MaterialSchema } from './entities/material.entity';
import {
  MaterialImage,
  MaterialImageSchema,
} from './entities/material-image.entity';
import {
  SearchCondition,
  SearchConditionSchema,
} from './entities/search-condition.entity';
import {
  OperationLog,
  OperationLogSchema,
} from './entities/operation-log.entity';
import { Category, CategorySchema } from '../category/entities/category.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema },
      { name: MaterialImage.name, schema: MaterialImageSchema },
      { name: SearchCondition.name, schema: SearchConditionSchema },
      { name: OperationLog.name, schema: OperationLogSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [
    MaterialController,
    AdvancedSearchController,
    BatchOperationsController,
    EnhancedMaterialController,
    SearchConditionController,
  ],
  providers: [
    MaterialService,
    AdvancedSearchService,
    BatchOperationsService,
    EnhancedMaterialService,
  ],
  exports: [
    MaterialService,
    AdvancedSearchService,
    BatchOperationsService,
    EnhancedMaterialService,
  ],
})
export class MaterialModule {}
