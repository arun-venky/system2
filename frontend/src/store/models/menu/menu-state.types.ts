import { MenuItem } from './menu-item.types';

export interface MenuState {
  isAuthenticated: boolean;
  user: null;
  token: null;
  refreshToken: null;
  permissions: [];
  roles: [];
  menuItemsCache: Record<string, MenuItem[]>;
  isLoading: boolean;
  errorMessage: string | null;
} 