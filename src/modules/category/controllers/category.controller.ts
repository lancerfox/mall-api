import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { DeleteCategoryDto } from '../dto/delete-category.dto';
import { MoveCategoryDto } from '../dto/move-category.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import {
  CategoryTreeResponseDto,
  CategoryListResponseDto,
  CreateCategoryResponseDto,
  BatchDeleteResponseDto,
  MoveCategoryResponseDto,
} from '../dto/category-response.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';

@ApiTags('分类管理')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('tree')
  @ApiOperation({ summary: '获取分类树' })
  @ApiResponse({
    status: 200,
    description: '获取分类树成功',
    type: CategoryTreeResponseDto,
  })
  async tree() {
    return await this.categoryService.findTree();
  }

  @Get('list-all')
  @ApiOperation({ summary: '获取所有分类列表' })
  @ApiResponse({
    status: 200,
    description: '获取分类列表成功',
    type: CategoryListResponseDto,
  })
  async listAll() {
    return await this.categoryService.findAll();
  }

  @Post('create')
  @ApiOperation({ summary: '创建分类' })
  @ApiResponse({
    status: 200,
    description: '创建分类成功',
    type: CreateCategoryResponseDto,
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser('sub') userId: string,
  ) {
    const category = await this.categoryService.create(
      createCategoryDto,
      userId,
    );
    return { categoryId: category.categoryId };
  }

  @Post('update')
  @ApiOperation({ summary: '更新分类' })
  @ApiResponse({
    status: 200,
    description: '更新分类成功',
    type: SuccessResponseDto,
  })
  async update(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser('sub') userId: string,
  ) {
    await this.categoryService.update(updateCategoryDto, userId);
    return { success: true, message: '更新成功' };
  }

  @Post('delete')
  @ApiOperation({ summary: '删除分类' })
  @ApiResponse({
    status: 200,
    description: '删除分类成功',
    type: SuccessResponseDto,
  })
  async delete(@Body() deleteCategoryDto: DeleteCategoryDto) {
    await this.categoryService.remove(deleteCategoryDto.categoryId);
    return { success: true, message: '删除成功' };
  }

  @Post('move')
  @ApiOperation({ summary: '移动分类' })
  @ApiResponse({
    status: 200,
    description: '移动分类成功',
    type: MoveCategoryResponseDto,
  })
  async move(
    @Body() moveCategoryDto: MoveCategoryDto,
    @CurrentUser('sub') userId: string,
  ) {
    await this.categoryService.move(moveCategoryDto, userId);
    return { success: true, message: '移动成功' };
  }
}
