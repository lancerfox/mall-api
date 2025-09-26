import { Menu } from '../entities/menu.entity';

export interface MenuTree extends Omit<Menu, 'children'> {
  children: MenuTree[];
}
