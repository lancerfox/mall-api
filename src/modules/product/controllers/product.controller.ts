import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { SaveProductDto } from '../dto/save-product.dto';
import { ProductListDto } from '../dto/product-list.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { ProductDetailDto } from '../dto/product-detail.dto';
import { IApiResponse } from '../../../common/types/api-response.interface';

@ApiTags('商品管理')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('save')
  @ApiOperation({ summary: '保存商品（保存草稿或发布）' })
  @ApiResponse({
    status: 200,
    description: '保存成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '保存成功' },
        data: { $ref: '#/components/schemas/ProductSPU' },
      },
    },
  })
  async save(@Body() saveProductDto: SaveProductDto): Promise<IApiResponse> {
    const product = await this.productService.saveProduct(saveProductDto);
    return {
      code: 200,
      message: '保存成功',
      data: product,
    };
  }

  @Post('list')
  @ApiOperation({ summary: '获取商品列表（分页）' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取成功' },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProductSPU' },
            },
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            pageSize: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  async list(@Body() productListDto: ProductListDto): Promise<IApiResponse> {
    const result = await this.productService.getProductList(productListDto);
    return {
      code: 200,
      message: '获取成功',
      data: result,
    };
  }

  @Post('detail')
  @ApiOperation({ summary: '获取商品详情' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取成功' },
        data: {
          type: 'object',
          properties: {
            spu: { $ref: '#/components/schemas/ProductSPU' },
            skus: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProductSKU' },
            },
          },
        },
      },
    },
  })
  async detail(
    @Body() productDetailDto: ProductDetailDto,
  ): Promise<IApiResponse> {
    const result = await this.productService.getProductDetail(productDetailDto);
    return {
      code: 200,
      message: '获取成功',
      data: result,
    };
  }

  @Post('updateStatus')
  @ApiOperation({ summary: '更新商品状态（上架/下架）' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '更新成功' },
        data: { type: 'null', example: null },
      },
    },
  })
  async updateStatus(
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<IApiResponse> {
    await this.productService.updateProductStatus(updateStatusDto);
    return {
      code: 200,
      message: '更新成功',
      data: null,
    };
  }

  @Post('delete')
  @ApiOperation({ summary: '删除商品' })
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
  async delete(@Body() body: { ids: string[] }): Promise<IApiResponse> {
    await this.productService.deleteProducts(body.ids);
    return {
      code: 200,
      message: '删除成功',
      data: null,
    };
  }
}
