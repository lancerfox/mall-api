import { Types } from 'mongoose';
import { Menu } from '../entities/menu.entity';

export interface MenuTree extends Menu {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  children: MenuTree[];
}
