import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import {
  Permissions,
  PERMISSIONS,
} from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserListResponseDto } from '../dto/user-list-response.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UpdatePermissionsDto } from '../dto/update-permissions.dto';
import {
  BatchOperationDto,
  BatchUpdateStatusDto,
} from '../dto/batch-operation.dto';
import { MongoIdValidationPipe } from '../../../common/pipes/mongo-id-validation.pipe';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({
    status: 200,
    description: '获取用户列表成功',
    type: UserListResponseDto,
  })
  @Permissions(PERMISSIONS.USER_READ)
  async findAll(@Query() query: QueryUserDto): Promise<UserListResponseDto> {
    console.log(query);
    return await this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiResponse({
    status: 200,
    description: '获取用户详情成功',
    type: UserResponseDto,
  })
  @Permissions(PERMISSIONS.USER_READ)
  async findOne(
    @Param('id', MongoIdValidationPipe) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({
    status: 201,
    description: '创建用户成功',
    type: UserResponseDto,
  })
  @Permissions(PERMISSIONS.USER_CREATE)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return await this.userService.create(createUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiResponse({
    status: 200,
    description: '更新用户信息成功',
    type: UserResponseDto,
  })
  @Permissions(PERMISSIONS.USER_UPDATE)
  async update(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id') currentUserId: string,
  ): Promise<UserResponseDto> {
    // 防止用户修改自己的角色和状态
    if (currentUserId === id) {
      delete updateUserDto.role;
      delete updateUserDto.status;
    }

    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({
    status: 200,
    description: '删除用户成功',
  })
  @Permissions(PERMISSIONS.USER_DELETE)
  async remove(
    @Param('id', MongoIdValidationPipe) id: string,
    @CurrentUser('id') currentUserId: string,
  ): Promise<{ message: string }> {
    // 防止用户删除自己
    if (currentUserId === id) {
      throw new HttpException('不能删除自己的账户', HttpStatus.BAD_REQUEST);
    }

    await this.userService.remove(id);
    return { message: '删除用户成功' };
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新用户状态' })
  @ApiResponse({
    status: 200,
    description: '更新用户状态成功',
    type: UserResponseDto,
  })
  @Permissions(PERMISSIONS.USER_UPDATE_STATUS)
  async updateStatus(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateStatusDto: UpdateUserStatusDto,
    @CurrentUser('id') currentUserId: string,
  ): Promise<UserResponseDto> {
    // 防止用户修改自己的状态
    if (currentUserId === id) {
      throw new HttpException('不能修改自己的状态', HttpStatus.BAD_REQUEST);
    }

    return await this.userService.updateStatus(id, updateStatusDto.status);
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: '重置用户密码' })
  @ApiResponse({
    status: 200,
    description: '重置密码成功',
  })
  @Permissions(PERMISSIONS.USER_RESET_PASSWORD)
  async resetPassword(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string; newPassword?: string }> {
    const result = await this.userService.resetPassword(id, resetPasswordDto);
    return result;
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: '更新用户权限' })
  @ApiResponse({
    status: 200,
    description: '更新用户权限成功',
    type: UserResponseDto,
  })
  @Permissions(PERMISSIONS.PERMISSION_ASSIGN)
  async updatePermissions(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updatePermissionsDto: UpdatePermissionsDto,
  ): Promise<UserResponseDto> {
    return await this.userService.updatePermissions(
      id,
      updatePermissionsDto.permissions,
    );
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: '获取用户权限' })
  @ApiResponse({
    status: 200,
    description: '获取用户权限成功',
  })
  @Permissions(PERMISSIONS.PERMISSION_VIEW)
  async getUserPermissions(
    @Param('id', MongoIdValidationPipe) id: string,
  ): Promise<{ permissions: string[] }> {
    const permissions = await this.userService.getUserPermissions(id);
    return { permissions };
  }

  @Post('batch/status')
  @ApiOperation({ summary: '批量更新用户状态' })
  @ApiResponse({
    status: 200,
    description: '批量更新用户状态成功',
  })
  @Permissions(PERMISSIONS.USER_UPDATE_STATUS)
  async batchUpdateStatus(
    @Body() batchUpdateStatusDto: BatchUpdateStatusDto,
    @CurrentUser('id') currentUserId: string,
  ): Promise<{ message: string; modifiedCount: number }> {
    // 过滤掉当前用户ID
    const filteredIds = batchUpdateStatusDto.userIds.filter(
      (id: string) => id !== currentUserId,
    );

    const result = await this.userService.batchUpdateStatus(
      filteredIds,
      batchUpdateStatusDto.status,
    );
    return {
      message: '批量更新用户状态成功',
      modifiedCount: result.modifiedCount,
    };
  }

  @Post('batch/delete')
  @ApiOperation({ summary: '批量删除用户' })
  @ApiResponse({
    status: 200,
    description: '批量删除用户成功',
  })
  @Permissions(PERMISSIONS.USER_DELETE)
  async batchDelete(
    @Body() batchOperationDto: BatchOperationDto,
    @CurrentUser('id') currentUserId: string,
  ): Promise<{ message: string; deletedCount: number }> {
    const result = await this.userService.batchDelete(
      batchOperationDto.userIds,
      currentUserId,
    );
    return {
      message: '批量删除用户成功',
      deletedCount: result.deletedCount,
    };
  }

  // 添加测试需要的方法别名
  @Get(':id/detail')
  @ApiOperation({ summary: '根据ID获取用户详情' })
  @ApiResponse({
    status: 200,
    description: '获取用户详情成功',
    type: UserResponseDto,
  })
  @Permissions(PERMISSIONS.USER_READ)
  async findById(
    @Param('id', MongoIdValidationPipe) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Delete(':id/remove')
  @ApiOperation({ summary: '根据ID删除用户' })
  @ApiResponse({
    status: 200,
    description: '删除用户成功',
  })
  @Permissions(PERMISSIONS.USER_DELETE)
  async deleteById(
    @Param('id', MongoIdValidationPipe) id: string,
    @CurrentUser('id') currentUserId: string,
  ): Promise<{ message: string }> {
    // 防止用户删除自己
    if (currentUserId === id) {
      throw new HttpException('不能删除自己的账户', HttpStatus.BAD_REQUEST);
    }

    await this.userService.deleteById(id);
    return { message: '用户删除成功' };
  }

  @Put(':id/user-status')
  @ApiOperation({ summary: '更新用户状态（别名）' })
  @ApiResponse({
    status: 200,
    description: '更新用户状态成功',
    type: UserResponseDto,
  })
  @Permissions(PERMISSIONS.USER_UPDATE_STATUS)
  async updateUserStatus(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateStatusDto: UpdateUserStatusDto,
    @CurrentUser('id') currentUserId: string,
  ): Promise<UserResponseDto> {
    // 防止用户修改自己的状态
    if (currentUserId === id) {
      throw new HttpException('不能修改自己的状态', HttpStatus.BAD_REQUEST);
    }

    return await this.userService.updateUserStatus(id, updateStatusDto.status);
  }

  @Post(':id/reset-user-password')
  @ApiOperation({ summary: '重置用户密码（别名）' })
  @ApiResponse({
    status: 200,
    description: '重置密码成功',
  })
  @Permissions(PERMISSIONS.USER_RESET_PASSWORD)
  async resetUserPassword(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string; newPassword?: string }> {
    const result = await this.userService.resetUserPassword(
      id,
      resetPasswordDto,
    );
    return result;
  }

  @Post('batch/delete-users')
  @ApiOperation({ summary: '批量删除用户（别名）' })
  @ApiResponse({
    status: 200,
    description: '批量删除用户成功',
  })
  @Permissions(PERMISSIONS.USER_DELETE)
  async batchDeleteUsers(
    @Body() batchOperationDto: BatchOperationDto,
    @CurrentUser('id') currentUserId: string,
  ): Promise<{ message: string; deletedCount: number }> {
    const result = await this.userService.batchDeleteUsers(
      batchOperationDto.userIds,
      currentUserId,
    );
    return {
      message: '批量删除用户成功',
      deletedCount: result.deletedCount,
    };
  }

  @Get(':id/menus')
  @ApiOperation({ summary: '获取用户菜单' })
  @ApiResponse({
    status: 200,
    description: '获取用户菜单成功',
  })
  @Permissions(PERMISSIONS.USER_READ)
  async getUserMenus(
    @Param('id', MongoIdValidationPipe) id: string,
  ): Promise<{ permissions: string[]; menus: any[] }> {
    const result = await this.userService.getUserMenus(id);
    return result;
  }
}
