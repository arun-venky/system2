import { defineStore } from 'pinia';
import type { Menu } from '@/store/models/menu/menu.types';  
import type { MenuState } from '@/store/models/menu/menu-state.types';  
import type { Role } from '@/store/models/role/role.types';
import api from '@/utils/api';

export const useMenuStore = defineStore('menu', {
  state: (): MenuState => ({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    permissions: [],
    roles: [],
    menusCache: {} as Record<string, Menu>,
    isLoading: false,
    errorMessage: null,
    availableRoles: []
  }),

  getters: {
    getAllMenus: (state) => {
      return Object.values(state.menusCache);
    },

    getMenuById: (state) => (id: string) => {
      return state.menusCache[id] || null;
    },
    
    getMenuBySlug: (state) => (slug: string) => {
      return Object.values(state.menusCache).find(menu => menu.slug === slug) || null;
    },

    getRootMenus: (state) => {
      return Object.values(state.menusCache).filter(menu => !menu.parent);
    }
  },

  actions: {
    async fetchMenus() {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const apiResponse = await api.get('/menus');
        const response = apiResponse.data;
        
        this.menusCache = response.menus.reduce((acc: Record<string, Menu>, menu: Menu) => {
          acc[menu._id] = menu;
          return acc;
        }, {} as Record<string, Menu>);

        if (response.roles) {
          this.availableRoles = response.roles;
        }
        
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to fetch menus';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async createMenu(menuData: Partial<Menu>) {
      try {
        const response = await api.post('/menus', menuData);
        this.menusCache[response.data._id] = response.data;
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    async updateMenu(menuId: string, menuData: Partial<Menu>) {
      try {
        const response = await api.put(`/menus/${menuId}`, menuData);
        this.menusCache[menuId] = response.data;
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    async deleteMenu(menuId: string) {
      try {
        await api.delete(`/menus/${menuId}`);
        delete this.menusCache[menuId];
      } catch (error) {
        throw error;
      }
    },
    
    async bulkDelete(menus: string[]) {
      try {
        return await Promise.all(menus.map(id => this.deleteMenu(id)));      
      } catch (error) {
        throw error;
      }
    },    
    
    clearMenusCache(menuId?: string) {
      if (menuId) {
        delete this.menusCache[menuId];
      } else {
        Object.keys(this.menusCache).forEach(id => delete this.menusCache[id]);
      }
    },

    async reorderMenus(menuIds: string[]) {
      try {
        const response = await api.put('/menus/reorder', { menuIds });
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  }
}); 