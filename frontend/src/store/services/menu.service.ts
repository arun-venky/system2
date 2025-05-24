import api from '../../utils/api';
import { Menu, MenuItem } from '@/store/models';

const menuItemsCache: Record<string, MenuItem[]> = {};

export const menuService = {
  async fetchMenus() {
    const response = await api.get('/menus');
    return response.data;
  },

  async createMenu(menuData: Partial<Menu>) {
    const response = await api.post('/menus', menuData);
    return response.data;
  },

  async updateMenu(id: string, menuData: Partial<Menu>) {
    const response = await api.put(`/menus/${id}`, menuData);
    return response.data;
  },

  async deleteMenu(id: string) {
    const response = await api.delete(`/menus/${id}`);
    return response.data;
  },

  async addMenuItem(menuId: string, item: MenuItem) {
    const response = await api.post(`/menus/${menuId}/items`, item);
    return response.data;
  },

  async updateMenuItem(menuId: string, itemId: string, item: Partial<MenuItem>) {
    const response = await api.put(`/menus/${menuId}/items/${itemId}`, item);
    return response.data;
  },

  async deleteMenuItem(menuId: string, itemId: string) {
    const response = await api.delete(`/menus/${menuId}/items/${itemId}`);
    return response.data;
  },

  async reorderMenuItems(menuId: string, itemIds: string[]) {
    const response = await api.put(`/menus/${menuId}/reorder`, { itemIds });
    return response.data;
  },

  async getMenuItems(menuId: string, forceRefresh = false) {
    if (!forceRefresh && menuItemsCache[menuId]) {
      // Return cached items if available and not forcing refresh
      return menuItemsCache[menuId];
    }
    const response = await api.get(`/menus/${menuId}/items`);
    menuItemsCache[menuId] = response.data;
    return response.data;
  },

  clearMenuItemsCache(menuId?: string) {
    if (menuId) {
      delete menuItemsCache[menuId];
    } else {
      Object.keys(menuItemsCache).forEach(id => delete menuItemsCache[id]);
    }
  }
}; 