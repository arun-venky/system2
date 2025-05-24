import type { Menu } from './menu.types';
import type { Role } from '../role/role.types';

export interface MenuContext {
  menus: Menu[];
  roles: Role[];
  selectedMenu: Menu | null;
  errorMessage: string | null;
  isLoading: boolean;
  formData: {
    name: string;
    label: string;
    icon: string;
    slug: string;
    displayOrder: number;
    parent?: string;
    pageElement?: string;
  };
} 