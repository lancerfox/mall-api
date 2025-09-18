import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { AdvancedSearchService } from '../services/advanced-search.service';
import {
  AdvancedSearchDto,
  SaveSearchConditionDto,
  DeleteSearchConditionDto,
} from '../dto/advanced-search.dto';
import {
  AdvancedSearchResponseDto,
  SearchConditionResponseDto,
  SaveSearchConditionResponseDto,
} from '../dto/advanced-search-response.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';

@ApiTags('材料管理')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('material')
export class AdvancedSearchController {
  constructor(private readonly advancedSearchService: AdvancedSearchService) {}

  @Post('advanced-search')
  @ApiOperation({ summary: '高级搜索' })
  @ApiResponse({
    status: 200,
    description: '搜索成功',
    type: AdvancedSearchResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async advancedSearch(@Body() searchDto: AdvancedSearchDto) {
    return await this.advancedSearchService.advancedSearch(searchDto);
  }
}

@ApiTags('搜索条件管理')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchConditionController {
  constructor(private readonly advancedSearchService: AdvancedSearchService) {}

  @Post('save-condition')
  @ApiOperation({ summary: '保存搜索条件' })
  @ApiResponse({
    status: 200,
    description: '保存成功',
    type: SaveSearchConditionResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 409, description: '搜索条件名称已存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async saveCondition(
    @Body() saveDto: SaveSearchConditionDto,
    @CurrentUser('sub') userId: string,
  ) {
    return await this.advancedSearchService.saveSearchCondition(
      saveDto,
      userId,
    );
  }

  @Get('condition-list')
  @ApiOperation({ summary: '获取保存的搜索条件列表' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [SearchConditionResponseDto],
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async getConditionList(@CurrentUser('sub') userId: string) {
    return await this.advancedSearchService.getSearchConditions(userId);
  }

  @Post('delete-condition')
  @ApiOperation({ summary: '删除搜索条件' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '搜索条件不存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async deleteCondition(
    @Body() deleteDto: DeleteSearchConditionDto,
    @CurrentUser('sub') userId: string,
  ) {
    await this.advancedSearchService.deleteSearchCondition(deleteDto, userId);
    return null;
  }
}
