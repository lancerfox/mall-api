import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserListResponseDto } from '../dto/user-list-response.dto';
import { RoleService } from '../../role/services/role.service';
import { Role, RoleDocument } from '../../role/entities/role.entity';
import { RoleType } from '../../../common/enums/role-type.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private roleService: RoleService,
  ) {}

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户信息或null
   */
  async findOne(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).populate('roles').exec();
  }

  /**
   * 根据用户ID查找用户
   * @param id 用户ID
   * @returns 用户信息或null
   */
  async findById(id: string): Promise<UserResponseDto | null> {
    try {
      const user = await this.userModel
        .findById(id)
        .select('-password')
        .populate('roles')
        .exec();
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
      avatar?: string;
    },
  ): Promise<UserResponseDto> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .populate('roles')
      .exec();

    if (!updatedUser) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
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
    const { page = 1, limit = 10, username, status, roles } = query;

    // 构建查询条件
    const filter: FilterQuery<UserDocument> = {};

    if (username) {
      filter.username = { $regex: username, $options: 'i' };
    }

    if (status) {
      filter.status = status;
    }

    if (roles) {
      filter.roles = roles;
    }

    // 计算跳过的文档数量
    const skip = (page - 1) * limit;

    // 执行查询
    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password')
        .populate('roles')
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

    // 验证角色是否存在
    if (createUserDto.roles && createUserDto.roles.length > 0) {
      const roles = await this.roleService.findByIds(createUserDto.roles);
      if (roles.length !== createUserDto.roles.length) {
        throw new HttpException('部分角色不存在', HttpStatus.BAD_REQUEST);
      }
    }

    // 创建新用户
    const newUser = new this.userModel(createUserDto);
    const savedUser = await newUser.save();

    // 重新查询以获取populated的数据
    const userWithRoles = await this.userModel
      .findById(savedUser._id)
      .select('-password')
      .populate('roles')
      .exec();

    return this.transformUserToResponse(userWithRoles!);
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

    // 验证角色是否存在
    if (updateUserDto.roles && updateUserDto.roles.length > 0) {
      const roles = await this.roleService.findByIds(updateUserDto.roles);
      if (roles.length !== updateUserDto.roles.length) {
        throw new HttpException('部分角色不存在', HttpStatus.BAD_REQUEST);
      }
    }

    // 更新用户信息
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .populate('roles')
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
   * 检查用户是否有指定权限
   * @param userId 用户ID
   * @param permission 权限标识
   * @returns 是否有权限
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).populate('roles').exec();
    if (!user) {
      return false;
    }

    // 获取用户所有权限
    const permissions = this.getUserPermissions(user);
    return permissions.includes(permission);
  }

  /**
   * 检查用户是否有指定角色
   * @param userId 用户ID
   * @param roleNames 角色名称列表
   * @returns 是否有角色
   */
  async hasRole(userId: string, roleNames: string[]): Promise<boolean> {
    const user = await this.userModel.findById(userId).populate('roles').exec();
    if (!user) {
      return false;
    }

    const userRoles = user.roles as RoleDocument[];
    const userRoleNames = userRoles.map((role) => role.name);

    return roleNames.some((roleName) => userRoleNames.includes(roleName));
  }

  /**
   * 获取用户所有权限
   * @param user 用户文档
   * @returns 权限列表
   */
  getUserPermissions(user: UserDocument): string[] {
    const roles = (user.roles as Role[]) || [];
    const allPermissions = new Set<string>();

    for (const role of roles) {
      if (role?.permissions) {
        // Assuming permissions can be populated Permission documents or just strings
        const permissions = role.permissions as (
          | { name: string }
          | string
          | { toObject: () => { name: string } }
        )[];
        permissions.forEach((p) => {
          if (typeof p === 'string') {
            allPermissions.add(p);
          } else if (p && 'name' in p) {
            allPermissions.add(p.name);
          }
        });
      }
    }

    // 去重
    return [...allPermissions];
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
    const user = await this.userModel.findById(userId).populate('roles').exec();

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    // 获取用户所有权限
    const permissions = this.getUserPermissions(user);

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
        id: 'role',
        name: '角色管理',
        path: '/role',
        icon: 'role',
        permission: 'role:read',
        children: [
          {
            id: 'role-list',
            name: '角色列表',
            path: '/role/list',
            permission: 'role:read',
          },
        ],
      },
      {
        id: 'permission',
        name: '权限管理',
        path: '/permission',
        icon: 'permission',
        permission: 'permission:read',
        children: [
          {
            id: 'permission-list',
            name: '权限列表',
            path: '/permission/list',
            permission: 'permission:read',
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
    return allMenus
      .map((menu) => {
        if (menu.children) {
          const filteredChildren = menu.children.filter(
            (child) =>
              !child.permission || permissions.includes(child.permission),
          );
          if (filteredChildren.length > 0) {
            return { ...menu, children: filteredChildren };
          }
        }
        if (
          !menu.children &&
          (!menu.permission || permissions.includes(menu.permission))
        ) {
          return menu;
        }
        return null;
      })
      .filter((menu) => menu !== null);
  }

  /**
   * 创建初始管理员用户
   * 此方法用于应用启动时检查和创建默认管理员
   */
  async createInitialAdmin(): Promise<void> {
    const adminUsername = 'admin';
    const existingAdmin = await this.findOne(adminUsername);

    if (existingAdmin) {
      console.log('管理员账户已存在');
      return;
    }

    const superAdminRole = (await this.roleService.findByType(
      RoleType.SUPER_ADMIN,
    )) as RoleDocument;

    if (!superAdminRole) {
      console.error(
        '未找到 "super_admin" 角色，无法创建初始管理员。请先运行 init-rbac 脚本。',
      );
      return;
    }

    const createUserDto: CreateUserDto = {
      username: adminUsername,
      password: 'admin',
      roles: [String(superAdminRole._id)],
    };

    await this.create(createUserDto);
    console.log('初始管理员账户创建成功: admin/admin');
  }

  /**
   * 转换用户文档为响应格式
   * @param user 用户文档
   * @returns 用户响应数据
   */
  private transformUserToResponse(user: UserDocument): UserResponseDto {
    const userObj = user.toObject<
      User & {
        _id: Types.ObjectId;
        roles: (Role & { _id: Types.ObjectId })[];
        createdAt: Date;
        updatedAt: Date;
      }
    >();

    const roles = (userObj.roles || []).map((role) => ({
      id: role._id.toString(),
      name: role.name,
      type: role.type,
    }));

    // 判断是否是超级管理员（拥有super_admin角色类型）
    const isSuperAdmin = roles.some(
      (role) => role.type === RoleType.SUPER_ADMIN,
    );

    return {
      id: userObj._id.toString(),
      username: userObj.username,
      roles,
      status: userObj.status,
      avatar: userObj.avatar,
      permissions: [], // 这里可以根据需要计算权限
      lastLoginTime: userObj.lastLoginTime,
      lastLoginIp: userObj.lastLoginIp,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt,
      isSuperAdmin,
    };
  }
}
