import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MaterialService } from '../services/material.service';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { MaterialListDto } from '../dto/material-list.dto';
import { MaterialDetailDto } from '../dto/material-detail.dto';
import { DeleteMaterialDto } from '../dto/delete-material.dto';
import { BatchDeleteMaterialDto } from '../dto/batch-delete-material.dto';
import { ToggleStatusDto } from '../dto/toggle-status.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import {
  MaterialListResponseDto,
  CreateMaterialResponseDto,
  BatchDeleteResponseDto,
  MaterialResponseDto,
} from '../dto/material-response.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';

@ApiTags('素材管理')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('v1/materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get('list')
  @ApiOperation({ summary: '获取素材列表' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: MaterialListResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async list(@Query() query: MaterialListDto) {
    return await this.materialService.findAll(query);
  }

  @Get('detail')
  @ApiOperation({ summary: '获取素材详情' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: MaterialResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '素材不存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async detail(@Query() query: MaterialDetailDto) {
    // enhanced 已经在 DTO 中定义为 boolean 类型，直接传递
    return await this.materialService.findOne(query.materialId, query.enhanced);
  }

  @Post('create')
  @ApiOperation({ summary: '创建素材' })
  @ApiResponse({
    status: 200,
    description: '创建成功',
    type: CreateMaterialResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 409, description: '素材名称已存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async create(
    @Body() createMaterialDto: CreateMaterialDto,
    @CurrentUser('sub') userId: string,
  ) {
    const material = await this.materialService.create(
      createMaterialDto,
      userId,
    );
    return { materialId: material.materialId };
  }

  @Post('update')
  @ApiOperation({ summary: '更新素材' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '素材不存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async update(
    @Body() updateMaterialDto: UpdateMaterialDto,
    @CurrentUser('sub') userId: string,
  ) {
    await this.materialService.update(updateMaterialDto, userId);
    return null;
  }

  @Post('delete')
  @ApiOperation({ summary: '删除素材 (软删除)' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '素材不存在' })
  @ApiResponse({ status: 400, description: '素材已上架，无法删除' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async delete(@Body() deleteMaterialDto: DeleteMaterialDto) {
    await this.materialService.remove(deleteMaterialDto.materialId);
    return null;
  }

  @Post('batch-delete')
  @ApiOperation({ summary: '批量删除素材 (软删除)' })
  @ApiResponse({
    status: 200,
    description: '批量删除成功',
    type: BatchDeleteResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '部分素材不存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async batchDelete(@Body() batchDeleteDto: BatchDeleteMaterialDto) {
    return await this.materialService.batchDelete(batchDeleteDto);
  }

  @Post('toggle-status')
  @ApiOperation({ summary: '切换素材状态' })
  @ApiResponse({
    status: 200,
    description: '状态更新成功',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '素材不存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async toggleStatus(
    @Body() toggleStatusDto: ToggleStatusDto,
    @CurrentUser('sub') userId: string,
  ) {
    await this.materialService.toggleStatus(toggleStatusDto, userId);
    return null;
  }
}
