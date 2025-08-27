import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../entities/user.entity';
// import { IUserWithoutPassword } from '../../auth/types';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserListResponseDto } from '../dto/user-list-response.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户信息或null
   */
  async findOne(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  /**
   * 根据用户ID查找用户
   * @param id 用户ID
   * @returns 用户信息或null
   */
  async findById(id: string): Promise<UserResponseDto | null> {
    try {
      const user = await this.userModel.findById(id).select('-password').exec();
      if (!user) {
        console.log(`User not found with ID: ${id}`);
        return null;
      }
      return this.transformUserToResponse(user);
    } catch (error: unknown) {
      console.error(`Error finding user by ID ${id}:`, error);
      return null;
    }
  }

  /**
   * 更新用户最后登录时间和IP
   * @param id 用户ID
   * @param ip IP地址
   * @returns 更新结果
   */
  async updateLastLogin(id: string, ip?: string): Promise<void> {
    const updateData: { lastLoginTime: Date; lastLoginIp?: string } = {
      lastLoginTime: new Date(),
    };

    if (ip) {
      updateData.lastLoginIp = ip;
    }

    await this.userModel.findByIdAndUpdate(id, updateData).exec();
  }

  /**
   * 更新用户资料
   * @param id 用户ID
   * @param updateData 更新数据
   * @returns 更新后的用户信息
   */
  async updateProfile(
    id: string,
    updateData: {
      email: string;
      realName: string;
      phone?: string;
      avatar?: string;
    },
  ): Promise<UserResponseDto> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new Error('用户不存在');
    }

    return this.transformUserToResponse(updatedUser);
  }

  /**
   * 更新用户密码
   * @param id 用户ID
   * @param newPassword 新密码（将自动加密）
   */
  async updatePassword(id: string, newPassword: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, { password: newPassword })
      .exec();
  }

  /**
   * 获取用户列表（分页、搜索、筛选）
   * @param query 查询参数
   * @returns 用户列表和分页信息
   */
  async findAll(query: QueryUserDto): Promise<UserListResponseDto> {
    const {
      page = 1,
      limit = 10,
      username,
      email,
      realName,
      role,
      status,
    } = query;

    // 构建查询条件
    const filter: FilterQuery<UserDocument> = {};

    if (username) {
      filter.username = { $regex: username, $options: 'i' };
    }

    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }

    if (realName) {
      filter.realName = { $regex: realName, $options: 'i' };
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    // 计算跳过的文档数量
    const skip = (page - 1) * limit;

    // 执行查询
    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    // 转换数据格式
    const data = users.map((user) => this.transformUserToResponse(user));

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * 创建用户
   * @param createUserDto 创建用户数据
   * @returns 创建的用户信息
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // 检查用户名是否已存在
    const existingUser = await this.userModel
      .findOne({ username: createUserDto.username })
      .exec();
    if (existingUser) {
      throw new HttpException('用户名已存在', HttpStatus.CONFLICT);
    }

    // 检查邮箱是否已存在
    const existingEmail = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();
    if (existingEmail) {
      throw new HttpException('邮箱已存在', HttpStatus.CONFLICT);
    }

    // 创建新用户
    const newUser = new this.userModel(createUserDto);
    const savedUser = await newUser.save();

    return this.transformUserToResponse(savedUser);
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param updateUserDto 更新数据
   * @returns 更新后的用户信息
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // 检查用户是否存在
    const existingUser = await this.userModel.findById(id).exec();
    if (!existingUser) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    // 如果更新邮箱，检查邮箱是否已被其他用户使用
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.userModel
        .findOne({
          email: updateUserDto.email,
          _id: { $ne: id },
        })
        .exec();
      if (emailExists) {
        throw new HttpException('邮箱已被其他用户使用', HttpStatus.CONFLICT);
      }
    }

    // 如果更新密码，需要加密
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    // 更新用户信息
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new HttpException('更新用户失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.transformUserToResponse(updatedUser);
  }

  /**
   * 删除用户
   * @param id 用户ID
   */
  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * 更新用户状态
   * @param id 用户ID
   * @param status 新状态
   * @returns 更新后的用户信息
   */
  async updateStatus(id: string, status: string): Promise<UserResponseDto> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    return this.transformUserToResponse(updatedUser);
  }

  /**
   * 重置用户密码
   * @param id 用户ID
   * @param resetPasswordDto 重置密码数据
   * @returns 重置结果
   */
  async resetPassword(
    id: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string; newPassword?: string }> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    // 加密新密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      resetPasswordDto.newPassword,
      saltRounds,
    );

    // 更新密码
    await this.userModel
      .findByIdAndUpdate(id, { password: hashedPassword })
      .exec();

    const result: { message: string; newPassword?: string } = {
      message: '密码重置成功',
    };

    // 如果需要返回新密码（用于邮件通知等）
    if (resetPasswordDto.sendEmail) {
      result.newPassword = resetPasswordDto.newPassword;
    }

    return result;
  }

  /**
   * 生成随机密码
   * @param length 密码长度
   * @returns 随机密码
   */
  generateRandomPassword(length: number = 8): string {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * 更新用户权限
   * @param id 用户ID
   * @param permissions 权限列表
   * @returns 更新后的用户信息
   */
  async updatePermissions(
    id: string,
    permissions: string[],
  ): Promise<UserResponseDto> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { permissions }, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    return this.transformUserToResponse(updatedUser);
  }

  /**
   * 检查用户是否有指定权限
   * @param userId 用户ID
   * @param permission 权限标识
   * @returns 是否有权限
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.userModel
      .findById(userId)
      .select('permissions role')
      .exec();
    if (!user) {
      return false;
    }

    // 超级管理员拥有所有权限
    if (user.role === 'super_admin') {
      return true;
    }

    // 检查用户是否有指定权限
    return user.permissions.includes(permission);
  }

  /**
   * 检查用户是否有指定角色
   * @param userId 用户ID
   * @param roles 角色列表
   * @returns 是否有角色
   */
  async hasRole(userId: string, roles: string[]): Promise<boolean> {
    const user = await this.userModel.findById(userId).select('role').exec();
    if (!user) {
      return false;
    }

    return roles.includes(user.role);
  }

  /**
   * 获取用户的所有权限（包括角色默认权限）
   * @param userId 用户ID
   * @returns 权限列表
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.userModel
      .findById(userId)
      .select('permissions role')
      .exec();
    if (!user) {
      return [];
    }

    let permissions = [...user.permissions];

    // 根据角色添加默认权限
    const rolePermissions = this.getRoleDefaultPermissions(user.role);
    permissions = [...new Set([...permissions, ...rolePermissions])];

    return permissions;
  }

  /**
   * 获取角色的默认权限
   * @param role 角色
   * @returns 权限列表
   */
  private getRoleDefaultPermissions(role: string): string[] {
    const rolePermissionMap: Record<string, string[]> = {
      super_admin: [
        'user:read',
        'user:write',
        'user:delete',
        'menu:read',
        'menu:write',
        'menu:delete',
        'system:read',
        'system:write',
        'log:read',
      ],
      admin: [
        'user:read',
        'user:write',
        'menu:read',
        'menu:write',
        'system:read',
        'log:read',
      ],
      operator: ['user:read', 'menu:read', 'system:read', 'log:read'],
    };

    return rolePermissionMap[role] || [];
  }

  /**
   * 批量更新用户状态
   * @param userIds 用户ID列表
   * @param status 新状态
   * @returns 更新结果
   */
  async batchUpdateStatus(
    userIds: string[],
    status: string,
  ): Promise<{ modifiedCount: number }> {
    const result = await this.userModel
      .updateMany({ _id: { $in: userIds } }, { status })
      .exec();

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * 批量删除用户
   * @param userIds 用户ID列表
   * @param currentUserId 当前用户ID（防止删除自己）
   * @returns 删除结果
   */
  async batchDelete(
    userIds: string[],
    currentUserId: string,
  ): Promise<{ deletedCount: number }> {
    // 过滤掉当前用户ID
    const filteredIds = userIds.filter((id) => id !== currentUserId);

    const result = await this.userModel
      .deleteMany({ _id: { $in: filteredIds } })
      .exec();

    return { deletedCount: result.deletedCount };
  }

  /**
   * 获取用户菜单
   * @param userId 用户ID
   * @returns 用户菜单信息
   */
  async getUserMenus(userId: string): Promise<{
    permissions: string[];
    menus: any[];
  }> {
    const user = await this.userModel
      .findById(userId)
      .select('permissions role')
      .exec();

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    // 获取用户所有权限
    const permissions = await this.getUserPermissions(userId);

    // 根据权限生成菜单（这里是示例，实际应该从菜单表查询）
    const menus = this.generateMenusByPermissions(permissions);

    return {
      permissions,
      menus,
    };
  }

  /**
   * 根据权限生成菜单
   * @param permissions 权限列表
   * @returns 菜单列表
   */
  private generateMenusByPermissions(permissions: string[]): any[] {
    const allMenus = [
      {
        id: 'user',
        name: '用户管理',
        path: '/user',
        icon: 'user',
        permission: 'user:read',
        children: [
          {
            id: 'user-list',
            name: '用户列表',
            path: '/user/list',
            permission: 'user:read',
          },
        ],
      },
      {
        id: 'system',
        name: '系统管理',
        path: '/system',
        icon: 'system',
        permission: 'system:read',
        children: [
          {
            id: 'system-config',
            name: '系统配置',
            path: '/system/config',
            permission: 'system:read',
          },
        ],
      },
    ];

    // 根据权限过滤菜单
    return allMenus.filter((menu) => {
      if (menu.children) {
        menu.children = menu.children.filter(
          (child: any) =>
            !child.permission || permissions.includes(child.permission),
        );
        return menu.children.length > 0;
      }
      return !menu.permission || permissions.includes(menu.permission);
    });
  }

  /**
   * 根据ID删除用户
   * @param id 用户ID
   */
  async deleteById(id: string): Promise<void> {
    return this.remove(id);
  }

  /**
   * 更新用户状态
   * @param id 用户ID
   * @param status 新状态
   * @returns 更新后的用户信息
   */
  async updateUserStatus(id: string, status: string): Promise<UserResponseDto> {
    return this.updateStatus(id, status);
  }

  /**
   * 重置用户密码
   * @param id 用户ID
   * @param resetPasswordDto 重置密码数据
   * @returns 重置结果
   */
  async resetUserPassword(
    id: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string; newPassword?: string }> {
    return this.resetPassword(id, resetPasswordDto);
  }

  /**
   * 批量删除用户
   * @param userIds 用户ID列表
   * @param currentUserId 当前用户ID（防止删除自己）
   * @returns 删除结果
   */
  async batchDeleteUsers(
    userIds: string[],
    currentUserId: string,
  ): Promise<{ deletedCount: number }> {
    return this.batchDelete(userIds, currentUserId);
  }

  /**
   * 转换用户文档为响应格式
   * @param user 用户文档
   * @returns 用户响应数据
   */
  private transformUserToResponse(user: UserDocument): UserResponseDto {
    const userObj = user.toObject() as {
      _id: string;
      username: string;
      email: string;
      realName: string;
      role: string;
      status: string;
      avatar?: string;
      phone?: string;
      permissions?: string[];
      lastLoginTime?: Date;
      lastLoginIp?: string;
      createdAt: Date;
      updatedAt: Date;
    };
    return {
      _id: String(userObj._id),
      username: userObj.username,
      email: userObj.email,
      realName: userObj.realName,
      role: userObj.role,
      status: userObj.status,
      avatar: userObj.avatar,
      phone: userObj.phone,
      permissions: userObj.permissions || [],
      lastLoginTime: userObj.lastLoginTime,
      lastLoginIp: userObj.lastLoginIp,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt,
    };
  }
}
