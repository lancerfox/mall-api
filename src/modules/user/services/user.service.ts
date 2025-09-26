import { Injectable, HttpException } from '@nestjs/common';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserListResponseDto } from '../dto/user-list-response.dto';
import { RoleService } from '../../role/services/role.service';
import { RoleType } from '../../../common/enums/role-type.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private roleService: RoleService,
  ) {}

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户信息或null
   */
  async findOne(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['roles', 'roles.permissions'],
    });
  }

  /**
   * 根据用户ID查找用户
   * @param id 用户ID
   * @returns 用户信息或null
   */
  async findById(id: string): Promise<UserResponseDto | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['roles', 'roles.permissions'],
      });
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

    await this.userRepository.update(id, updateData);
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
    await this.userRepository.update(id, updateData);
    const updatedUser = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!updatedUser) {
      throw new HttpException('用户不存在', ERROR_CODES.USER_NOT_FOUND);
    }

    return this.transformUserToResponse(updatedUser);
  }

  /**
   * 更新用户密码
   * @param id 用户ID
   * @param newPassword 新密码（将自动加密）
   */
  async updatePassword(id: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new HttpException('用户不存在', ERROR_CODES.USER_NOT_FOUND);
    }

    user.password = newPassword;
    await this.userRepository.save(user);
  }

  /**
   * 获取用户列表（分页、搜索、筛选）
   * @param query 查询参数
   * @returns 用户列表和分页信息
   */
  async findAll(query: QueryUserDto): Promise<UserListResponseDto> {
    const { page = 1, pageSize = 10, username, status, roles } = query;

    const qb = this.userRepository.createQueryBuilder('user');
    qb.leftJoinAndSelect('user.roles', 'role');
    qb.leftJoinAndSelect('role.permissions', 'permission');

    if (username) {
      qb.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    if (roles && roles.length > 0) {
      qb.andWhere('role.id IN (:...roles)', { roles });
    }

    qb.orderBy('user.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize);
    qb.take(pageSize);

    const [users, total] = await qb.getManyAndCount();

    const data = users.map((user) => this.transformUserToResponse(user));
    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      total,
      page,
      pageSize,
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
    const existingUser = await this.userRepository.findOneBy({
      username: createUserDto.username,
    });
    if (existingUser) {
      throw new HttpException('用户名已存在', ERROR_CODES.USER_ALREADY_EXISTS);
    }

    const newUser = this.userRepository.create({
      username: createUserDto.username,
      password: createUserDto.password,
      status: 'active', // 默认状态
      avatar: createUserDto.avatar,
    });

    // 验证并关联角色
    if (createUserDto.roles && createUserDto.roles.length > 0) {
      const roles = await this.roleService.findByIds(createUserDto.roles);
      if (roles.length !== createUserDto.roles.length) {
        throw new HttpException('部分角色不存在', ERROR_CODES.ROLE_NOT_FOUND);
      }
      newUser.roles = roles;
    }

    // 保存新用户, BeforeInsert会自动加密密码
    const savedUser = await this.userRepository.save(newUser);

    // TypeORM的save操作后，如果设置了eager loading，关联的角色也会被加载
    // 如果没有，需要重新查询
    const userWithRoles = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['roles', 'roles.permissions'],
    });

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
    // 使用 preload 来加载并合并更新
    const userToUpdate = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!userToUpdate) {
      throw new HttpException('用户不存在', ERROR_CODES.USER_NOT_FOUND);
    }

    // 验证并更新角色
    if (updateUserDto.roles) {
      if (updateUserDto.roles.length > 0) {
        const roles = await this.roleService.findByIds(updateUserDto.roles);
        if (roles.length !== updateUserDto.roles.length) {
          throw new HttpException('部分角色不存在', ERROR_CODES.ROLE_NOT_FOUND);
        }
        userToUpdate.roles = roles;
      } else {
        // 如果传入空数组，则清空角色
        userToUpdate.roles = [];
      }
    }

    // 保存更新
    const updatedUser = await this.userRepository.save(userToUpdate);

    // 重新查询以获取完整的关联数据
    const userWithRelations = await this.userRepository.findOne({
      where: { id: updatedUser.id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!userWithRelations) {
      throw new HttpException('更新用户失败', ERROR_CODES.VALIDATION_FAILED);
    }

    return this.transformUserToResponse(userWithRelations);
  }

  /**
   * 删除用户
   * @param id 用户ID
   */
  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException('用户不存在', ERROR_CODES.USER_NOT_FOUND);
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
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });
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
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      return false;
    }

    const userRoleNames = user.roles.map((role) => role.name);

    return roleNames.some((roleName) => userRoleNames.includes(roleName));
  }

  /**
   * 获取用户所有权限
   * @param user 用户文档
   * @returns 权限列表
   */
  getUserPermissions(user: User): string[] {
    const allPermissions = new Set<string>();
    if (user.roles) {
      for (const role of user.roles) {
        if (role.permissions) {
          for (const permission of role.permissions) {
            allPermissions.add(permission.name);
          }
        }
      }
    }
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
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new HttpException('用户不存在', ERROR_CODES.USER_NOT_FOUND);
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

    const superAdminRole = await this.roleService.findByType(
      RoleType.SUPER_ADMIN,
    );

    if (!superAdminRole) {
      console.error(
        '未找到 "super_admin" 角色，无法创建初始管理员。请先运行 init-rbac 脚本。',
      );
      return;
    }

    const createUserDto: CreateUserDto = {
      username: adminUsername,
      password: 'admin',
      roles: [superAdminRole.id],
    };

    await this.create(createUserDto);
    console.log('初始管理员账户创建成功: admin/admin');
  }

  /**
   * 转换用户文档为响应格式
   * @param user 用户文档
   * @returns 用户响应数据
   */
  public transformUserToResponse(user: User): UserResponseDto {
    const roles = (user.roles || []).map((role) => ({
      id: role.id,
      name: role.name,
      type: role.type,
    }));

    // 判断是否是超级管理员（拥有super_admin角色类型）
    const isSuperAdmin = roles.some(
      (role) => role.type === RoleType.SUPER_ADMIN,
    );

    // 获取用户所有权限
    const permissions = this.getUserPermissions(user);

    return {
      id: user.id,
      username: user.username,
      roles,
      status: user.status,
      avatar: user.avatar,
      permissions: permissions, // 使用实际计算的权限
      lastLoginTime: user.lastLoginTime,
      lastLoginIp: user.lastLoginIp,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isSuperAdmin,
    };
  }
}
