import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from './modules/user/services/user.service';
import { CreateUserDto } from './modules/user/dto/create-user.dto';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private userService: UserService) {}

  /**
   * 模块初始化时执行
   * 检查并创建初始管理员账户
   */
  async onModuleInit() {
    const adminUsername = 'admin';
    const adminPassword = 'admin';

    try {
      // 检查管理员账户是否已存在
      const existingAdmin = await this.userService.findOne(adminUsername);

      if (!existingAdmin) {
        // 创建初始管理员账户
        const createUserDto: CreateUserDto = {
          username: adminUsername,
          password: adminPassword,
          role: 'super_admin',
        };
        await this.userService.create(createUserDto);
        console.log('初始管理员账户创建成功: admin/admin');
      } else {
        console.log('管理员账户已存在');
      }
    } catch (error: any) {
      console.error('创建初始管理员账户失败:', error);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
