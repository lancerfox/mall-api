import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from './modules/user/services/user.service';
import { CreateUserDto } from './modules/user/dto/create-user.dto';
import { RoleService } from './modules/role/services/role.service';
import { Role } from './modules/role/entities/role.entity';
import { RoleType } from './common/enums/role-type.enum';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private userService: UserService,
    private roleService: RoleService,
  ) {}

  /**
   * 模块初始化时执行
   * 检查并创建初始管理员账户
   */
  async onModuleInit() {
    const adminUsername = 'adminabaaaba';
    const adminPassword = 'xxx13579!';

    try {
      // 检查管理员账户是否已存在
      const existingAdmin = await this.userService.findOne(adminUsername);
      if (!existingAdmin) {
        console.log('❌ adminabaaaba 用户不存在');
        // 查找 super_admin 角色
        const superAdminRole = await this.roleService.findByType(
          RoleType.SUPER_ADMIN,
        );

        if (!superAdminRole) {
          console.error(
            '❌ 未找到 "super_admin" 角色，无法创建初始管理员。请先运行 init:dev-rbac 脚本,初始化数据。',
          );
          return;
        } else {
          console.log('✅ 已初始化数据rbac 脚本');
        }

        // 创建初始管理员账户
        const createUserDto: CreateUserDto = {
          username: adminUsername,
          password: adminPassword,
          roles: superAdminRole ? [superAdminRole.id] : [],
        };
        await this.userService.create(createUserDto);
        console.log('✅ 初始管理员账户创建成功');
      } else {
        console.log('✅ 管理员账户已存在');
      }
    } catch (error: any) {
      console.error('❌ 创建初始管理员账户失败:', error);
    }
  }
}
