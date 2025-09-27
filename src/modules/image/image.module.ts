import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ImageController } from './controllers/image.controller';
import { ImageService } from './services/image.service';
import { SupabaseService } from './services/supabase.service';
import { Image } from './entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Image]), ConfigModule],
  controllers: [ImageController],
  providers: [ImageService, SupabaseService],
  exports: [ImageService, SupabaseService],
})
export class ImageModule {}
