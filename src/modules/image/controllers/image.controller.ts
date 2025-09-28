import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
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
import { IApiResponse } from '../../../common/types/api-response.interface';

@ApiTags('图片管理')
@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('getUploadToken')
  @ApiOperation({ summary: '获取图片上传凭证' })
  @ApiResponse({
    status: 200,
    description: '获取上传凭证成功',
    type: UploadTokenResponseDto,
  })
  async getUploadToken(
    @Body() uploadTokenDto: UploadTokenDto,
  ): Promise<IApiResponse<UploadTokenResponseDto>> {
    return this.imageService.getUploadToken(uploadTokenDto);
  }

  @Post('create')
  @ApiOperation({ summary: '创建图片记录' })
  @ApiResponse({
    status: 200,
    description: '图片入库成功',
    type: CreateImageResponseDto,
  })
  async createImage(
    @Body() createImageDto: CreateImageDto,
  ): Promise<IApiResponse<CreateImageResponseDto>> {
    return this.imageService.createImage(createImageDto);
  }

  @Post('list')
  @ApiOperation({ summary: '获取图片库列表' })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    type: ImageListResponseDto,
  })
  async getImageList(
    @Body() imageListDto: ImageListDto,
  ): Promise<ImageListResponseDto> {
    return this.imageService.getImageList(imageListDto);
  }

  @Post('delete')
  @ApiOperation({
    summary: '删除图片',
    description:
      '根据图片ID删除图片记录和Supabase中的文件。支持单个删除和批量删除两种模式。',
  })
  @ApiBody({
    type: DeleteImageDto,
    description: '单个图片删除请求体',
    examples: {
      single: {
        summary: '单个删除示例',
        value: { imageId: '550e8400-e29b-41d4-a716-446655440000' },
      },
    },
  })
  @ApiBody({
    type: BatchDeleteImageDto,
    description: '批量图片删除请求体',
    examples: {
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
    status: 200,
    description: '删除成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '操作成功' },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 9007 },
        message: { type: 'string', example: '数据验证失败' },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '图片不存在',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 7000 },
        message: { type: 'string', example: '图片不存在' },
        data: { type: 'null', example: null },
      },
    },
  })
  async deleteImage(
    @Body() deleteImageDto: DeleteImageDto | BatchDeleteImageDto,
  ): Promise<IApiResponse<null>> {
    // 检查是否是批量删除请求（通过imageIds字段判断）
    if (
      (deleteImageDto as BatchDeleteImageDto).imageIds &&
      Array.isArray((deleteImageDto as BatchDeleteImageDto).imageIds)
    ) {
      return this.imageService.batchDeleteImages(
        (deleteImageDto as BatchDeleteImageDto).imageIds,
      );
    }

    // 单张图片删除
    return this.imageService.deleteImage(
      (deleteImageDto as DeleteImageDto).imageId,
    );
  }

  @Post('health')
  @ApiOperation({ summary: '检查Supabase连接状态' })
  @ApiResponse({
    status: 200,
    description: '连接状态检查结果',
  })
  async checkHealth(): Promise<
    IApiResponse<{ connected: boolean; bucketExists: boolean }>
  > {
    return this.imageService.checkSupabaseConnection();
  }
}
