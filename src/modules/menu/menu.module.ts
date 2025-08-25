import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Menu, MenuSchema } from './entities/menu.entity';
import { MenuController } from './controllers/menu.controller';
import { MenuService } from './services/menu.service';
import { UserModule } from '../user/user.module';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [
    // 注册Menu Schema到MongoDB
    MongooseModule.forFeature([{ name: Menu.name, schema: MenuSchema }]),
    // 使用forwardRef避免循环依赖
    forwardRef(() => UserModule),
  ],
  controllers: [MenuController],
  providers: [MenuService, RolesGuard],
  exports: [MenuService],
})
export class MenuModule {}
