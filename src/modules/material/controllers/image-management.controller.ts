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
import { ImageManagementService } from '../services/image-management.service';
import {
  UploadImageDto,
  BatchUploadImagesDto,
  DeleteImageDto,
  GetImageListDto,
  SetMainImageDto,
  SortImagesDto,
} from '../dto/image-management.dto';
import {
  UploadImageResponseDto,
  BatchUploadResponseDto,
  ImageListResponseDto,
} from '../dto/image-management-response.dto';

@ApiTags('图片管理')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class ImageManagementController {
  constructor(
    private readonly imageManagementService: ImageManagementService,
  ) {}

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
    return await this.imageManagementService.uploadImage(file, body, userId);
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
    return await this.imageManagementService.batchUploadImages(
      files,
      body,
      userId,
    );
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
  async deleteImage(
    @Body() body: DeleteImageDto,

    @CurrentUser('sub') userId: string,
  ) {
    return await this.imageManagementService.deleteImage(body, userId);
  }

  @Get('image-list')
  @ApiOperation({ summary: '获取材料图片列表' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: ImageListResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async getImageList(@Query() query: GetImageListDto) {
    return await this.imageManagementService.getImageList(query);
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
  async setMainImage(
    @Body() body: SetMainImageDto,

    @CurrentUser('sub') userId: string,
  ) {
    return await this.imageManagementService.setMainImage(body, userId);
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
  async sortImages(
    @Body() body: SortImagesDto,

    @CurrentUser('sub') userId: string,
  ) {
    return await this.imageManagementService.sortImages(body, userId);
  }
}
