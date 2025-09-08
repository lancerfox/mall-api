import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuController } from './controllers/menu.controller';
import { MenuService } from './services/menu.service';
import { Menu, MenuSchema } from './entities/menu.entity';
import { PermissionModule } from '../permission/permission.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Menu.name, schema: MenuSchema }]),
    PermissionModule,
    RoleModule,
  ],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
