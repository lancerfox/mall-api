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
// import { MongoIdValidationPipe } from '../../../common/pipes/mongo-id-validation.pipe';
import { UserIdQueryDto } from '../dto/user-id-query.dto';
import { UserIdBodyDto } from '../dto/user-id-body.dto';
import { UpdateUserWithIdDto } from '../dto/update-user-with-id.dto';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('list')
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({
    status: 200,
    description: '获取用户列表成功',
    type: UserListResponseDto,
  })
  @Permissions(PERMISSIONS.USER_READ)
  async findAll(@Query() query: QueryUserDto): Promise<UserListResponseDto> {
    return await this.userService.findAll(query);
  }

  @Get('detail')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiResponse({
    status: 200,
    description: '获取用户详情成功',
    type: UserResponseDto,
  })
  @Permissions(PERMISSIONS.USER_READ)
  async findOne(@Query() query: UserIdQueryDto): Promise<UserResponseDto> {
    const user = await this.userService.findById(query.id);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Post('create')
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

  @Post('update')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiResponse({
    status: 200,
    description: '更新用户信息成功',
    type: UserResponseDto,
  })
  @Permissions(PERMISSIONS.USER_UPDATE)
  async update(
    @Body() updateUserWithIdDto: UpdateUserWithIdDto,
    @CurrentUser('id') currentUserId: string,
  ): Promise<UserResponseDto> {
    const { id, ...updateUserDto } = updateUserWithIdDto;

    // 防止用户修改自己的角色和状态
    if (currentUserId === id) {
      delete (updateUserDto as Partial<UpdateUserDto>).roles;
      delete (updateUserDto as Partial<UpdateUserDto>).status;
    }

    return await this.userService.update(id, updateUserDto);
  }

  @Post('delete')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({
    status: 200,
    description: '删除用户成功',
  })
  @Permissions(PERMISSIONS.USER_DELETE)
  async remove(
    @Body() userIdDto: UserIdBodyDto,
    @CurrentUser('id') currentUserId: string,
  ): Promise<{ message: string }> {
    console.log(userIdDto);
    // 防止用户删除自己
    if (currentUserId === userIdDto.id) {
      throw new HttpException('不能删除自己的账户', HttpStatus.BAD_REQUEST);
    }

    await this.userService.remove(userIdDto.id);
    return { message: '删除用户成功' };
  }

  @Get('menus')
  @ApiOperation({ summary: '获取用户菜单' })
  @ApiResponse({
    status: 200,
    description: '获取用户菜单成功',
  })
  @Permissions(PERMISSIONS.USER_READ)
  async getUserMenus(
    @Query() query: UserIdQueryDto,
  ): Promise<{ permissions: string[]; menus: any[] }> {
    const result = await this.userService.getUserMenus(query.id);
    return result;
  }
}
