import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { User, UserSchema } from './entities/user.entity';
import { MenuModule } from '../menu/menu.module';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [
    // 注册User Schema到MongoDB
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    // 使用forwardRef避免循环依赖
    forwardRef(() => MenuModule),
  ],
  controllers: [UserController, PermissionsController],
  providers: [UserService, RolesGuard],
  exports: [UserService], // 导出UserService供AuthModule使用
})
export class UserModule {}
