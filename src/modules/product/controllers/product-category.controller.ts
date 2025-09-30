import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductCategoryService } from '../services/product-category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { DeleteCategoryDto } from '../dto/delete-category.dto';
import { ProductCategoryResponseDto } from '../dto/product-category-response.dto';

@ApiTags('商品分类管理')
@Controller('product/category')
@ApiBearerAuth()
export class ProductCategoryController {
  constructor(private readonly categoryService: ProductCategoryService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建商品分类' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '创建成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 201 },
        message: { type: 'string', example: '创建成功' },
        data: { $ref: '#/components/schemas/ProductCategoryResponseDto' },
      },
    },
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<ProductCategoryResponseDto> {
    return this.categoryService.create(createCategoryDto);
  }

  @Post('update')
  @ApiOperation({ summary: '更新商品分类' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '更新成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '更新成功' },
        data: { $ref: '#/components/schemas/ProductCategoryResponseDto' },
      },
    },
  })
  async update(
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ProductCategoryResponseDto> {
    return this.categoryService.update(updateCategoryDto.id, updateCategoryDto);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除商品分类' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '删除成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '删除成功' },
        data: { type: 'null' },
      },
    },
  })
  async delete(@Body() deleteCategoryDto: DeleteCategoryDto): Promise<void> {
    await this.categoryService.delete(deleteCategoryDto);
  }

  @Get('list')
  @ApiOperation({ summary: '获取商品分类列表（树形结构）' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取成功' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductCategoryResponseDto' },
        },
      },
    },
  })
  async list(): Promise<ProductCategoryResponseDto[]> {
    return this.categoryService.findAll();
  }

  @Post('detail')
  @ApiOperation({ summary: '获取商品分类详情' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取成功' },
        data: { $ref: '#/components/schemas/ProductCategoryResponseDto' },
      },
    },
  })
  async detail(
    @Body() body: { id: string },
  ): Promise<ProductCategoryResponseDto> {
    return this.categoryService.findOne(body.id);
  }
}
