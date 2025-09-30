import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ImageService } from '../services/image.service';
import { CreateImageDto } from '../dto/create-image.dto';
import { ImageListDto } from '../dto/image-list.dto';
import { UploadTokenDto } from '../dto/upload-token.dto';
import { DeleteImageDto } from '../dto/delete-image.dto';
import { BatchDeleteImageDto } from '../dto/batch-delete-image.dto';
import {
  UploadTokenResponseDto,
  CreateImageResponseDto,
} from '../dto/image-response.dto';
import { ImageListResponseDto } from '../dto/image-list-response.dto';

@ApiTags('图片管理')
@Controller('image')
@ApiBearerAuth()
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('getUploadToken')
  @ApiOperation({ summary: '获取图片上传凭证' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取上传凭证成功',
    type: UploadTokenResponseDto,
  })
  async getUploadToken(
    @Body() uploadTokenDto: UploadTokenDto,
  ): Promise<UploadTokenResponseDto> {
    return this.imageService.getUploadToken(uploadTokenDto);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建图片记录' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '图片入库成功',
    type: CreateImageResponseDto,
  })
  async createImage(
    @Body() createImageDto: CreateImageDto,
  ): Promise<CreateImageResponseDto> {
    return this.imageService.createImage(createImageDto);
  }

  @Post('list')
  @ApiOperation({ summary: '获取图片库列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '查询成功',
    type: ImageListResponseDto,
  })
  async getImageList(
    @Body() imageListDto: ImageListDto,
  ): Promise<ImageListResponseDto> {
    return this.imageService.getImageList(imageListDto);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除图片',
    description:
      '根据图片ID删除图片记录和Supabase中的文件。支持单个删除和批量删除两种模式。',
  })
  @ApiBody({
    description: '单个或批量图片删除请求体',
    type: DeleteImageDto,
    examples: {
      single: {
        summary: '单个删除示例',
        value: { imageId: '550e8400-e29b-41d4-a716-446655440000' },
      },
      batch: {
        summary: '批量删除示例',
        value: {
          imageIds: [
            '550e8400-e29b-41d4-a716-446655440000',
            '550e8400-e29b-41d4-a716-446655440001',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '删除成功',
  })
  async deleteImage(
    @Body() deleteImageDto: DeleteImageDto | BatchDeleteImageDto,
  ): Promise<void> {
    if (
      (deleteImageDto as BatchDeleteImageDto).imageIds &&
      Array.isArray((deleteImageDto as BatchDeleteImageDto).imageIds)
    ) {
      await this.imageService.batchDeleteImages(
        (deleteImageDto as BatchDeleteImageDto).imageIds,
      );
    } else {
      await this.imageService.deleteImage(
        (deleteImageDto as DeleteImageDto).imageId,
      );
    }
  }

  @Post('health')
  @ApiOperation({ summary: '检查Supabase连接状态' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '连接状态检查结果',
  })
  async checkHealth(): Promise<{ connected: boolean; bucketExists: boolean }> {
    return this.imageService.checkSupabaseConnection();
  }
}
