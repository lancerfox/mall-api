import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import {
  CategoryCreateResponseDto,
  CategoryListResponseDto,
  CategoryDetailResponseDto,
  CategoryUpdateResponseDto,
  CategoryDeleteResponseDto,
} from './dto/category-response.dto';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

@ApiTags('分类管理')
@Controller('categories')
@UsePipes(new ValidationPipe({ transform: true }))
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('create')
  @ApiOperation({
    summary: '创建分类',
    description: '创建一个新的珠子材料分类',
  })
  @ApiBody({
    type: CreateCategoryDto,
    description: '分类创建信息',
    examples: {
      example1: {
        summary: '创建水晶珠分类',
        value: {
          name: '水晶珠',
          description: '各种水晶材质的珠子',
          status: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '分类创建成功',
    type: CategoryCreateResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  create(@Body() createCategoryDto: CreateCategoryDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id || 'system';
    return this.categoriesService.create(createCategoryDto, userId);
  }

  @Post('list')
  @ApiOperation({
    summary: '获取分类列表',
    description: '获取分类列表，支持分页和搜索',
  })
  @ApiBody({
    type: QueryCategoryDto,
    description: '查询参数',
    examples: {
      example1: {
        summary: '基础查询',
        value: {
          page: 1,
          limit: 10,
        },
      },
      example2: {
        summary: '搜索查询',
        value: {
          page: 1,
          limit: 10,
          keyword: '水晶',
          status: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '分类列表获取成功',
    type: CategoryListResponseDto,
  })
  findAll(@Body() query: QueryCategoryDto) {
    return this.categoriesService.findAll(query);
  }

  @Post('detail')
  @ApiOperation({
    summary: '获取分类详情',
    description: '根据ID获取分类详细信息',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '分类ID',
          example: '507f1f77bcf86cd799439011',
        },
      },
      required: ['id'],
    },
    description: '分类ID',
    examples: {
      example1: {
        summary: '获取分类详情',
        value: {
          id: '507f1f77bcf86cd799439011',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '分类详情获取成功',
    type: CategoryDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: '分类不存在' })
  findOne(@Body('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post('update')
  @ApiOperation({ summary: '更新分类', description: '更新分类信息' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '分类ID',
          example: '507f1f77bcf86cd799439011',
        },
        name: {
          type: 'string',
          description: '分类名称',
          example: '水晶珠',
          nullable: true,
        },
        description: {
          type: 'string',
          description: '分类描述',
          example: '各种水晶材质的珠子',
          nullable: true,
        },
        status: {
          type: 'number',
          description: '状态 1-启用 0-禁用',
          example: 1,
          nullable: true,
        },
      },
      required: ['id'],
    },
    description: '更新分类信息',
    examples: {
      example1: {
        summary: '更新分类名称',
        value: {
          id: '507f1f77bcf86cd799439011',
          name: '天然水晶珠',
        },
      },
      example2: {
        summary: '更新完整信息',
        value: {
          id: '507f1f77bcf86cd799439011',
          name: '天然水晶珠',
          description: '高品质天然水晶材质珠子',
          status: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '分类更新成功',
    type: CategoryUpdateResponseDto,
  })
  @ApiResponse({ status: 404, description: '分类不存在' })
  update(
    @Body('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id || 'system';
    return this.categoriesService.update(id, updateCategoryDto, userId);
  }

  @Post('delete')
  @ApiOperation({ summary: '删除分类', description: '根据ID删除分类' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '分类ID',
          example: '507f1f77bcf86cd799439011',
        },
      },
      required: ['id'],
    },
    description: '删除分类',
    examples: {
      example1: {
        summary: '删除分类',
        value: {
          id: '507f1f77bcf86cd799439011',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '分类删除成功',
    type: CategoryDeleteResponseDto,
  })
  @ApiResponse({ status: 404, description: '分类不存在' })
  remove(@Body('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
