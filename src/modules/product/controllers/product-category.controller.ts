import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductCategoryService } from '../services/product-category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { DeleteCategoryDto } from '../dto/delete-category.dto';
import { IApiResponse } from '../../../common/types/api-response.interface';

@ApiTags('商品分类管理')
@Controller('product/category')
export class ProductCategoryController {
  constructor(private readonly categoryService: ProductCategoryService) {}

  @Post('create')
  @ApiOperation({ summary: '创建商品分类' })
  @ApiResponse({
    status: 200,
    description: '创建成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '创建成功' },
        data: { $ref: '#/components/schemas/ProductCategory' },
      },
    },
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<IApiResponse> {
    const category = await this.categoryService.create(createCategoryDto);
    return {
      code: 200,
      message: '创建成功',
      data: category,
    };
  }

  @Post('update')
  @ApiOperation({ summary: '更新商品分类' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '更新成功' },
        data: { $ref: '#/components/schemas/ProductCategory' },
      },
    },
  })
  async update(
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<IApiResponse> {
    const category = await this.categoryService.update(updateCategoryDto);
    return {
      code: 200,
      message: '更新成功',
      data: category,
    };
  }

  @Post('delete')
  @ApiOperation({ summary: '删除商品分类' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '删除成功' },
        data: { type: 'null', example: null },
      },
    },
  })
  async delete(
    @Body() deleteCategoryDto: DeleteCategoryDto,
  ): Promise<IApiResponse> {
    await this.categoryService.delete(deleteCategoryDto);
    return {
      code: 200,
      message: '删除成功',
      data: null,
    };
  }

  @Post('list')
  @ApiOperation({ summary: '获取商品分类列表（树形结构）' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取成功' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductCategory' },
        },
      },
    },
  })
  async list(): Promise<IApiResponse> {
    const categories = await this.categoryService.findAll();
    return {
      code: 200,
      message: '获取成功',
      data: categories,
    };
  }

  @Post('detail')
  @ApiOperation({ summary: '获取商品分类详情' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取成功' },
        data: { $ref: '#/components/schemas/ProductCategory' },
      },
    },
  })
  async detail(@Body() body: { id: string }): Promise<IApiResponse> {
    const category = await this.categoryService.findOne(body.id);
    return {
      code: 200,
      message: '获取成功',
      data: category,
    };
  }
}
