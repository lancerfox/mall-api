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
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import {
  MaterialCreateResponseDto,
  MaterialListResponseDto,
  MaterialDetailResponseDto,
  MaterialUpdateResponseDto,
  MaterialDeleteResponseDto,
  MaterialStockUpdateResponseDto,
} from './dto/material-response.dto';
import type { Request } from 'express';

@ApiTags('材料管理')
@Controller('materials')
@UsePipes(new ValidationPipe({ transform: true }))
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post('create')
  @ApiOperation({ summary: '创建材料', description: '创建一个新的珠子材料' })
  @ApiBody({
    type: CreateMaterialDto,
    description: '材料创建信息',
    examples: {
      example1: {
        summary: '创建红玛瑙珠',
        value: {
          name: '红玛瑙珠',
          categoryId: '507f1f77bcf86cd799439012',
          color: '红色',
          size: '8mm',
          shape: '圆形',
          material: '玛瑙',
          unit: '颗',
          price: 1.5,
          stock: 1000,
          minStock: 100,
          maxStock: 5000,
          description: '高品质红玛瑙珠，颜色鲜艳',
          status: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '材料创建成功',
    type: MaterialCreateResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  create(@Body() createMaterialDto: CreateMaterialDto, @Req() req: Request) {
    const userId = (req.user as { id: string })?.id;
    return this.materialsService.create(createMaterialDto, userId);
  }

  @Get('list')
  @ApiOperation({
    summary: '获取材料列表',
    description: '获取材料列表，支持分页、搜索和筛选',
  })
  @ApiBody({
    type: QueryMaterialDto,
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
          keyword: '玛瑙',
          categoryId: '507f1f77bcf86cd799439012',
          color: '红色',
          status: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '材料列表获取成功',
    type: MaterialListResponseDto,
  })
  findAll(@Body() query: QueryMaterialDto) {
    return this.materialsService.findAll(query);
  }

  @Get('detail')
  @ApiOperation({
    summary: '获取材料详情',
    description: '根据ID获取材料详细信息',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '材料ID',
          example: '507f1f77bcf86cd799439011',
        },
      },
      required: ['id'],
    },
    description: '材料ID',
    examples: {
      example1: {
        summary: '获取材料详情',
        value: {
          id: '507f1f77bcf86cd799439011',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '材料详情获取成功',
    type: MaterialDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: '材料不存在' })
  findOne(@Body('id') id: string) {
    return this.materialsService.findOne(id);
  }

  @Post('update')
  @ApiOperation({ summary: '更新材料', description: '更新材料信息' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '材料ID',
          example: '507f1f77bcf86cd799439011',
        },
        name: {
          type: 'string',
          description: '材料名称',
          example: '红玛瑙珠',
          nullable: true,
        },
        categoryId: {
          type: 'string',
          description: '分类ID',
          example: '507f1f77bcf86cd799439012',
          nullable: true,
        },
        color: {
          type: 'string',
          description: '颜色',
          example: '红色',
          nullable: true,
        },
        size: {
          type: 'string',
          description: '尺寸',
          example: '8mm',
          nullable: true,
        },
        shape: {
          type: 'string',
          description: '形状',
          example: '圆形',
          nullable: true,
        },
        material: {
          type: 'string',
          description: '材质',
          example: '玛瑙',
          nullable: true,
        },
        unit: {
          type: 'string',
          description: '单位',
          example: '颗',
          nullable: true,
        },
        price: {
          type: 'number',
          description: '价格',
          example: 1.5,
          nullable: true,
        },
        stock: {
          type: 'number',
          description: '库存数量',
          example: 1000,
          nullable: true,
        },
        minStock: {
          type: 'number',
          description: '最小库存',
          example: 100,
          nullable: true,
        },
        maxStock: {
          type: 'number',
          description: '最大库存',
          example: 5000,
          nullable: true,
        },
        description: {
          type: 'string',
          description: '描述',
          example: '高品质红玛瑙珠，颜色鲜艳',
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
    description: '更新材料信息',
    examples: {
      example1: {
        summary: '更新材料价格',
        value: {
          id: '507f1f77bcf86cd799439011',
          price: 2.0,
        },
      },
      example2: {
        summary: '更新完整信息',
        value: {
          id: '507f1f77bcf86cd799439011',
          name: '天然红玛瑙珠',
          color: '深红色',
          price: 2.0,
          stock: 1500,
          description: '天然高品质红玛瑙珠，颜色深邃鲜艳',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '材料更新成功',
    type: MaterialUpdateResponseDto,
  })
  @ApiResponse({ status: 404, description: '材料不存在' })
  update(
    @Body('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as { id: string })?.id;
    return this.materialsService.update(id, updateMaterialDto, userId);
  }

  @Post('update-stock')
  @ApiOperation({ summary: '更新库存', description: '更新材料库存数量' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '材料ID',
          example: '507f1f77bcf86cd799439011',
        },
        quantity: {
          type: 'number',
          description: '库存变化数量（正数为增加，负数为减少）',
          example: 100,
        },
      },
      required: ['id', 'quantity'],
    },
    description: '更新库存',
    examples: {
      example1: {
        summary: '增加库存',
        value: {
          id: '507f1f77bcf86cd799439011',
          quantity: 100,
        },
      },
      example2: {
        summary: '减少库存',
        value: {
          id: '507f1f77bcf86cd799439011',
          quantity: -50,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '库存更新成功',
    type: MaterialStockUpdateResponseDto,
  })
  @ApiResponse({ status: 404, description: '材料不存在' })
  updateStock(
    @Body('id') id: string,
    @Body('quantity') quantity: number,
    @Req() req: Request,
  ) {
    const userId = (req.user as { id: string })?.id;
    return this.materialsService.updateStock(id, quantity, userId);
  }

  @Post('delete')
  @ApiOperation({ summary: '删除材料', description: '删除材料' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '材料ID',
          example: '507f1f77bcf86cd799439011',
        },
      },
      required: ['id'],
    },
    description: '删除材料',
    examples: {
      example1: {
        summary: '删除材料',
        value: {
          id: '507f1f77bcf86cd799439011',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '材料删除成功',
    type: MaterialDeleteResponseDto,
  })
  @ApiResponse({ status: 404, description: '材料不存在' })
  remove(@Body('id') id: string) {
    return this.materialsService.remove(id);
  }
}
