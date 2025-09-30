import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { ProductImageService } from '../services/product-image.service';
import { UpdateProductImagesDto } from '../dto/update-product-images.dto';
import { SaveProductDto } from '../dto/save-product.dto';
import { ProductListDto } from '../dto/product-list.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { ProductDetailDto } from '../dto/product-detail.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { ProductListPaginatedDto } from '../dto/product-list-response.dto';
import { ProductEditResponseDto } from '../dto/product-edit-response.dto';

@ApiTags('商品管理')
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productImageService: ProductImageService,
  ) {}

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
        data: { $ref: '#/components/schemas/ProductResponseDto' },
      },
    },
  })
  async save(
    @Body() saveProductDto: SaveProductDto,
  ): Promise<ProductResponseDto> {
    return await this.productService.saveProduct(saveProductDto);
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
        data: { $ref: '#/components/schemas/ProductListPaginatedDto' },
      },
    },
  })
  async list(
    @Body() productListDto: ProductListDto,
  ): Promise<ProductListPaginatedDto> {
    return this.productService.getProductList(productListDto);
  }

  @Post('detail')
  @ApiOperation({ summary: '获取商品详情（用于编辑）' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取成功' },
        data: { $ref: '#/components/schemas/ProductEditResponseDto' },
      },
    },
  })
  async detail(
    @Body() productDetailDto: ProductDetailDto,
  ): Promise<ProductEditResponseDto> {
    return await this.productService.getProductDetail(productDetailDto);
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
  ): Promise<void> {
    await this.productService.updateProductStatus(updateStatusDto);
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
  async delete(@Body() body: { ids: string[] }): Promise<void> {
    await this.productService.deleteProducts(body.ids);
  }

  @Post('updateImages')
  @ApiOperation({ summary: '更新商品图片关联' })
  @ApiResponse({
    status: 200,
    description: '商品图片更新成功',
  })
  async updateProductImages(
    @Body() updateProductImagesDto: UpdateProductImagesDto,
  ): Promise<void> {
    await this.productImageService.updateProductImages(updateProductImagesDto);
  }
}
