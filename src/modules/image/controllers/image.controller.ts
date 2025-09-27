import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ImageService } from '../services/image.service';
import { CreateImageDto } from '../dto/create-image.dto';
import { ImageListDto } from '../dto/image-list.dto';
import { UploadTokenDto } from '../dto/upload-token.dto';
import {
  ImageResponseDto,
  UploadTokenResponseDto,
  CreateImageResponseDto,
} from '../dto/image-response.dto';
import {
  IApiResponse,
  IPaginatedResponse,
} from '../../../common/types/api-response.interface';

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
    type: [ImageResponseDto],
  })
  async getImageList(
    @Body() imageListDto: ImageListDto,
  ): Promise<IApiResponse<IPaginatedResponse<ImageResponseDto>>> {
    return this.imageService.getImageList(imageListDto);
  }

  @Post('delete')
  @ApiOperation({ summary: '删除图片' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
  })
  async deleteImage(
    @Body() body: { imageId: number },
  ): Promise<IApiResponse<null>> {
    return this.imageService.deleteImage(body.imageId);
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
