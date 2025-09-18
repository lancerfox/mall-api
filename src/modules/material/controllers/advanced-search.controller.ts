import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
// import { CurrentUser } from '../../../common/decorators/user.decorator';
import { AdvancedSearchService } from '../services/advanced-search.service';
import {
  AdvancedSearchDto,
  // SaveSearchConditionDto,
  // DeleteSearchConditionDto,
} from '../dto/advanced-search.dto';
import {
  AdvancedSearchResponseDto,
  // SearchConditionResponseDto,
  // SaveSearchConditionResponseDto,
} from '../dto/advanced-search-response.dto';
// import { SuccessResponseDto } from '../../../common/dto/success-response.dto';

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
