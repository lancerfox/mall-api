import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { EnhancedMaterialService } from '../services/enhanced-material.service';
import {
  MaterialDetailEnhancedDto,
  RelatedMaterialsDto,
  CopyMaterialDto,
} from '../dto/enhanced-material.dto';
import {
  MaterialDetailEnhancedResponseDto,
  RelatedMaterialsResponseDto,
  CopyMaterialResponseDto,
} from '../dto/enhanced-material-response.dto';

@ApiTags('增强材料详情')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('material')
export class EnhancedMaterialController {
  constructor(
    private readonly enhancedMaterialService: EnhancedMaterialService,
  ) {}

  @Get('detail-enhanced')
  @ApiOperation({ summary: '获取增强的材料详情' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: MaterialDetailEnhancedResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '材料不存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async getDetailEnhanced(@Query() detailDto: MaterialDetailEnhancedDto) {
    return await this.enhancedMaterialService.getEnhancedMaterialDetail(
      detailDto,
    );
  }

  @Get('related')
  @ApiOperation({ summary: '获取相关材料推荐' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: RelatedMaterialsResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '材料不存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async getRelatedMaterials(@Query() relatedDto: RelatedMaterialsDto) {
    return await this.enhancedMaterialService.getRelatedMaterials(relatedDto);
  }

  @Post('copy')
  @ApiOperation({ summary: '复制材料' })
  @ApiResponse({
    status: 200,
    description: '复制成功',
    type: CopyMaterialResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '材料不存在' })
  @ApiResponse({ status: 409, description: '材料名称已存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async copyMaterial(
    @Body() copyDto: CopyMaterialDto,
    @CurrentUser('sub') userId: string,
  ) {
    return await this.enhancedMaterialService.copyMaterial(copyDto, userId);
  }
}
