import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { User, UserSchema } from './entities/user.entity';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    // 注册User Schema到MongoDB
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    // 使用forwardRef避免循环依赖
    forwardRef(() => RoleModule),
  ],
  controllers: [UserController, PermissionsController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
