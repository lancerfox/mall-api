import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { UploadImageService } from '../services/upload-image.service';
import {
  UploadImageDto,
  BatchUploadImagesDto,
  DeleteImageDto,
  GetImageListDto,
  SetMainImageDto,
  SortImagesDto,
} from '../dto/upload-image.dto';
import {
  UploadImageResponseDto,
  BatchUploadResponseDto,
  ImageListResponseDto,
} from '../dto/upload-image-response.dto';

@ApiTags('通用图片上传')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/upload')
export class UploadImageController {
  constructor(private readonly uploadImageService: UploadImageService) {}

  @Post('image')
  @ApiOperation({ summary: '上传单张图片' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: '上传成功',
    type: UploadImageResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadImageDto,
    @CurrentUser('sub') userId: string,
  ) {
    return await this.uploadImageService.uploadImage(file, body, userId);
  }

  @Post('batch-images')
  @ApiOperation({ summary: '批量上传图片' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: '批量上传完成',
    type: BatchUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @UseInterceptors(FilesInterceptor('files', 10))
  async batchUploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: BatchUploadImagesDto,
    @CurrentUser('sub') userId: string,
  ) {
    return await this.uploadImageService.batchUploadImages(files, body, userId);
  }

  @Post('delete-image')
  @ApiOperation({ summary: '删除图片' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async deleteImage(@Body() body: DeleteImageDto) {
    return await this.uploadImageService.deleteImage(body);
  }

  @Get('image-list')
  @ApiOperation({ summary: '获取图片列表' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: ImageListResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async getImageList(@Query() query: GetImageListDto) {
    return await this.uploadImageService.getImageList(query);
  }

  @Post('set-main-image')
  @ApiOperation({ summary: '设置主图' })
  @ApiResponse({
    status: 200,
    description: '设置成功',
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async setMainImage(@Body() body: SetMainImageDto) {
    return await this.uploadImageService.setMainImage(body);
  }

  @Post('sort-images')
  @ApiOperation({ summary: '调整图片排序' })
  @ApiResponse({
    status: 200,
    description: '排序成功',
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async sortImages(@Body() body: SortImagesDto) {
    return await this.uploadImageService.sortImages(body);
  }
}
