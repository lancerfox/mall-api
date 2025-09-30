import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BusinessException } from 'src/common/exceptions/business.exception';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../../common/guards/roles.guard';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import {
  Permissions,
  PERMISSIONS,
} from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserListResponseDto } from '../dto/user-list-response.dto';
import { UserIdBodyDto } from '../dto/user-id-body.dto';
import { UpdateUserWithIdDto } from '../dto/update-user-with-id.dto';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(
  JwtAuthGuard,
  // RolesGuard
)
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
    return this.userService.findAll(query);
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
    return this.userService.create(createUserDto);
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

    return this.userService.update(id, updateUserDto);
  }

  @Post('delete')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({
    status: 200,
    description: '删除用户成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '删除成功' },
        data: { type: 'null' },
      },
    },
  })
  @Permissions(PERMISSIONS.USER_DELETE)
  async remove(
    @Body() userIdDto: UserIdBodyDto,
    @CurrentUser('id') currentUserId: string,
  ): Promise<void> {
    // 防止用户删除自己
    if (currentUserId === userIdDto.id) {
      // 可以在 error-codes.ts 中为这种情况添加一个特定的错误码
      throw new BusinessException(ERROR_CODES.USER_ID_UNDEFINED);
    }

    await this.userService.remove(userIdDto.id);
  }
}
