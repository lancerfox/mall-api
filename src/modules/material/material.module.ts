import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialController } from './controllers/material.controller';
import { BatchOperationsController } from './controllers/batch-operations.controller';
import { OperationLogController } from './controllers/operation-log.controller';
import { MaterialService } from './services/material.service';
import { BatchOperationsService } from './services/batch-operations.service';
import { OperationLogService } from './services/operation-log.service';
import { UploadModule } from '../upload/upload.module';
import { Material, MaterialSchema } from './entities/material.entity';
import {
  MaterialImage,
  MaterialImageSchema,
} from './entities/material-image.entity';

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
      { name: OperationLog.name, schema: OperationLogSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    UploadModule,
  ],
  controllers: [
    MaterialController,
    BatchOperationsController,
    OperationLogController,
  ],
  providers: [MaterialService, BatchOperationsService, OperationLogService],
  exports: [MaterialService, BatchOperationsService, OperationLogService],
})
export class MaterialModule {}
