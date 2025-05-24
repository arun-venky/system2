import type { Menu } from './menu.types';
import type { Role } from '../role/role.types';

export interface MenuState {
  isAuthenticated: boolean;
  user: null;
  token: null;
  refreshToken: null;
  permissions: string[];
  roles: Role[];
  menusCache: Record<string, Menu>;
  isLoading: boolean;
  errorMessage: string | null;
  availableRoles?: Role[];
} 