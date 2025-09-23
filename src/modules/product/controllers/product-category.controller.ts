import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductCategoryService } from '../services/product-category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { DeleteCategoryDto } from '../dto/delete-category.dto';
import { ProductCategoryResponseDto } from '../dto/product-category-response.dto';
import { ProductCategoryListResponseDto } from '../dto/product-category-response.dto';

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
  ): Promise<ProductCategoryResponseDto> {
    return await this.categoryService.create(createCategoryDto);
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
  ): Promise<ProductCategoryResponseDto> {
    return await this.categoryService.update(
      updateCategoryDto.id,
      updateCategoryDto,
    );
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
  ): Promise<{ message: string }> {
    await this.categoryService.delete(deleteCategoryDto);
    return { message: '删除成功' };
  }

  @Get('list')
  @ApiOperation({ summary: '获取商品分类列表（树形结构）' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: ProductCategoryListResponseDto,
  })
  async list(): Promise<ProductCategoryListResponseDto> {
    const categories = await this.categoryService.findAll();
    return {
      data: categories,
      total: categories.length,
      page: 1,
      pageSize: categories.length,
      totalPages: 1,
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
  async detail(
    @Body() body: { id: string },
  ): Promise<ProductCategoryResponseDto> {
    return await this.categoryService.findOne(body.id);
  }
}
