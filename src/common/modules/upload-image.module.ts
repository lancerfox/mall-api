import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Image, ImageSchema } from '../entities/image.entity';
import { UploadImageService } from '../services/upload-image.service';
import { UploadImageController } from '../controllers/upload-image.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
  ],
  controllers: [UploadImageController],
  providers: [UploadImageService],
  exports: [UploadImageService],
})
export class UploadImageModule {}
