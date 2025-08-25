import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UnauthorizedException,
  BadRequestException,
  UseGuards,
  Req,
  Ip,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { OperationLogService } from '../../log/services/operation-log.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Public } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { LoginDto } from '../dto/login.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { AuthResponseDto, UserInfoDto } from '../dto/auth-response.dto';
import { ILoginResponse } from '../types';
// import type { IJwtPayload } from '../types';
import type { JwtUser } from '../../../common/decorators/user.decorator';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private operationLogService: OperationLogService,
  ) {}

  /**
   * 用户登录接口
   * @param loginDto 登录数据传输对象
   * @param req 请求对象
   * @param ip 客户端IP地址
   * @returns 登录成功返回access_token、refresh_token和用户信息，失败返回401错误
   */
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '用户名或密码错误',
  })
  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Ip() ip: string,
  ): Promise<ILoginResponse> {
    const userAgent = req.headers['user-agent'];

    try {
      const user = await this.authService.validateUser(
        loginDto.username,
        loginDto.password,
        ip,
        userAgent,
      );

      if (!user) {
        // 记录登录失败日志
        try {
          await this.operationLogService.logLogin(
            '', // 用户ID未知
            loginDto.username,
            ip,
            userAgent,
            'error',
            '用户名或密码错误',
          );
        } catch (logError: unknown) {
          console.error('Failed to log failed login:', logError);
        }

        throw new UnauthorizedException('用户名或密码错误');
      }

      // 检查用户状态
      if (user.status !== 'active') {
        // 记录登录失败日志
        try {
          await this.operationLogService.logLogin(
            user._id,
            user.username,
            ip,
            userAgent,
            'error',
            '用户账户已被禁用或锁定',
          );
        } catch (logError: unknown) {
          console.error('Failed to log failed login:', logError);
        }

        throw new UnauthorizedException('用户账户已被禁用或锁定');
      }

      return await this.authService.login(user, ip, userAgent);
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // 记录系统错误
      try {
        await this.operationLogService.logLogin(
          '',
          loginDto.username,
          ip,
          userAgent,
          'error',
          '系统错误',
        );
      } catch (logError: unknown) {
        console.error('Failed to log system error:', logError);
      }

      throw new UnauthorizedException('登录失败，请稍后重试');
    }
  }

  /**
   * 获取当前用户资料接口
   * @param req 请求对象（包含用户信息）
   * @returns 当前用户资料信息
   */
  @ApiOperation({ summary: '获取当前用户资料' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: UserInfoDto,
  })
  @ApiResponse({
    status: 401,
    description: '未授权访问',
  })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser('sub') userId: string): Promise<UserInfoDto> {
    return this.authService.getProfile(userId);
  }

  /**
   * 更新用户资料接口
   * @param updateProfileDto 更新资料数据传输对象
   * @param req 请求对象（包含用户信息）
   * @param ip 客户端IP地址
   * @returns 更新后的用户资料信息
   */
  @ApiOperation({ summary: '更新用户资料' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: UserInfoDto,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
  })
  @ApiResponse({
    status: 401,
    description: '未授权访问',
  })
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser('sub') userId: string,
    @Req() req: Request,
    @Ip() ip: string,
  ): Promise<UserInfoDto> {
    const userAgent = req.headers['user-agent'];

    return await this.authService.updateProfile(
      userId,
      updateProfileDto,
      ip,
      userAgent,
    );
  }

  /**
   * 修改密码接口
   * @param changePasswordDto 修改密码数据传输对象
   * @param req 请求对象（包含用户信息）
   * @param ip 客户端IP地址
   * @returns 操作结果
   */
  @ApiOperation({ summary: '修改密码' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '修改成功',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '密码修改成功',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
  })
  @ApiResponse({
    status: 401,
    description: '未授权访问或当前密码不正确',
  })
  @UseGuards(JwtAuthGuard)
  @Put('password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser('sub') userId: string,
    @Req() req: Request,
    @Ip() ip: string,
  ): Promise<{ message: string }> {
    const userAgent = req.headers['user-agent'];

    // 验证新密码和确认密码是否一致
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('新密码和确认密码不一致');
    }

    await this.authService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
      ip,
      userAgent,
    );

    return { message: '密码修改成功' };
  }

  /**
   * 验证密码强度接口
   * @param body 包含密码的请求体
   * @returns 密码强度验证结果
   */
  @ApiOperation({ summary: '验证密码强度' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: {
          type: 'string',
          description: '待验证的密码',
          example: 'MyPassword123!',
        },
      },
      required: ['password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '验证成功',
    schema: {
      type: 'object',
      properties: {
        isValid: {
          type: 'boolean',
          description: '密码是否符合要求',
        },
        errors: {
          type: 'array',
          items: { type: 'string' },
          description: '错误信息列表',
        },
        score: {
          type: 'number',
          description: '密码强度评分（0-100）',
        },
      },
    },
  })
  @Public()
  @Post('validate-password')
  validatePassword(@Body() body: { password: string }) {
    if (!body.password) {
      throw new BadRequestException('密码不能为空');
    }

    return this.authService.validatePasswordStrength(body.password);
  }

  /**
   * 获取安全统计信息接口
   * @param user 当前用户信息
   * @returns 安全统计信息
   */
  @ApiOperation({ summary: '获取安全统计信息' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        totalAttempts: {
          type: 'number',
          description: '总登录尝试次数',
        },
        successfulAttempts: {
          type: 'number',
          description: '成功登录次数',
        },
        failedAttempts: {
          type: 'number',
          description: '失败登录次数',
        },
        lockedAccounts: {
          type: 'number',
          description: '被锁定的账户数量',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Get('security-stats')
  getSecurityStats(@CurrentUser() user: JwtUser) {
    return this.authService.getSecurityStats(user.username);
  }
}
