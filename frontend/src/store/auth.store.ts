import { defineStore } from 'pinia';
import { User, AuthState, Permission, Role } from '@/store/models';
import { useMenuStore } from '../store/menu.store'
import { authService } from './services/auth.service';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    permissions: [] as Permission[],
    roles: [] as Role[]
  }),

  getters: {
    menuStore: () => useMenuStore(),
    isAdmin: (state) => state.roles.some(role => role.name.toLowerCase() === 'admin'),
    hasPermission: (state) => (permission: string) => {
      console.log('hasPermission:', permission, state.permissions);
      //return state.permissions.some(p => p.resource.toLowerCase() === permission.toLowerCase());
      return true;
    },
    hasRole: (state) => (role: string) => 
      state.roles.some(r => r.name.toLowerCase() === role.toLowerCase())
  },

  actions: {
    setAuth(authData: { user: User; token: string; refreshToken: string }) {
      console.log('setAuth:', authData);
      this.isAuthenticated = true;
      this.user = authData.user;
      this.token = authData.token;
      this.refreshToken = authData.refreshToken;

      // Ensure permissions and roles are arrays
      this.permissions = Array.isArray(authData.user.permissions) 
      ? authData.user.permissions 
      : [{resource:"users","actions":["create","read","update","delete"]},
         {resource:"pages","actions":["create","read","update","delete"]},
         {resource:"menus","actions":["create","read","update","delete"]},
         {resource:"roles","actions":["create","read","update","delete"]},
         {resource:"security","actions":["create","read","update","delete"]}];

      this.roles = Array.isArray(authData.user.roles) 
        ? authData.user.roles 
        : [];

      // Store in localStorage for persistence
      localStorage.setItem('token', authData.token);
      localStorage.setItem('refreshToken', authData.refreshToken);
      localStorage.setItem('user', JSON.stringify(authData.user));

      console.log('Auth state updated:', {
        isAuthenticated: this.isAuthenticated,
        user: this.user,
        roles: this.roles,
        permissions: this.permissions
      });
    },

    async login(email: string, password: string) {
      try {
        const response = await authService.login(email, password);
        this.setAuth(response);
        return response;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },

    async logout() {
      try {
        await authService.logout();
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
      // Clear auth state
      this.isAuthenticated = false;
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.permissions = [];
      this.roles = [];

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      // Clear menu items cache
      this.menuStore.clearMenuItemsCache();

      // Clear other caches if needed
      // this.pageStore.clearCache();
      // this.roleStore.clearCache();
      // this.userStore.clearCache();
      // etc.      
      }   
    },

    async signup(username: string, email: string, password: string) {
      try {
        return await authService.signup(username, email, password);
      } catch (error) {
        throw error;
      }
    },

    async getRefreshToken(token: string) {
      if (!token) {
        return false;
      }

      try {
        const response = await authService.getRefreshToken(token);
        this.setAuth(response);
        return true;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
      }
    },

    initializeFromStorage() {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');

      if (token && refreshToken && userStr) {
        try {
          const user = JSON.parse(userStr);
          this.setAuth({ user, token, refreshToken });
          return true;
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          this.logout();
          return false;
        }
      }
      return false;
    },

    async verifyAuth() {
      console.log('Verifying auth status...');
      
      try {
        // Initialize from storage if not already initialized
        if (!this.token) {
          const initialized = this.initializeFromStorage();
          if (!initialized) {
            return false;
          }
        }

        // Check if token is expired
        const tokenData = JSON.parse(atob(this.token!.split('.')[1]));
        const isExpired = tokenData.exp * 1000 < Date.now();

        if (isExpired) {
          // Try to refresh the token
          const success = await this.getRefreshToken(this.token!);
          if (!success) {
            this.logout();
            return false;
          }
        }

        // Verify the token with the backend
        const isValid = await authService.verifyAuth(this.token!);
        if (!isValid) {
          this.logout();
          return false;
        }

        return true;
      } catch (error) {
        console.error('Auth verification failed:', error);
        this.logout();
        return false;
      }
    }
  }
}); 