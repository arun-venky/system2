import { ref } from 'vue';
import { Menu, MenuItem } from '@/store/models';
import { useMenuStore } from '../store/menu.store';

export function useMenuItems() {
  const menuStore = useMenuStore();
  const showItemsModal = ref(false);
  const selectedMenu = ref<Menu | null>(null);
  const menuItems = ref<MenuItem[]>([]);
  const editingItem = ref<MenuItem | null>(null);

  const openItemsModal = async (menu: Menu) => {
    selectedMenu.value = menu;
    try {
      menuItems.value = await menuStore.getMenuItems(menu._id);
      showItemsModal.value = true;
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, '_id'>) => {
    if (!selectedMenu.value) return;
    try {
      await menuStore.addMenuItem(selectedMenu.value._id, item);
      menuItems.value = await menuStore.getMenuItems(selectedMenu.value._id, true);
      return true;
    } catch (error) {
      console.error('Failed to add menu item:', error);
      return false;
    }
  };

  const updateMenuItem = async (itemId: string, updates: Partial<MenuItem>) => {
    if (!selectedMenu.value) return;
    try {
      await menuStore.updateMenuItem(selectedMenu.value._id, itemId, updates);
      menuItems.value = await menuStore.getMenuItems(selectedMenu.value._id, true);
      return true;
    } catch (error) {
      console.error('Failed to update menu item:', error);
      return false;
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    if (!selectedMenu.value) return;
    try {
      await menuStore.deleteMenuItem(selectedMenu.value._id, itemId);
      menuItems.value = await menuStore.getMenuItems(selectedMenu.value._id, true);
      return true;
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      return false;
    }
  };

  const reorderItems = async (itemIds: string[]) => {
    if (!selectedMenu.value) return;
    try {
      await menuStore.reorderMenuItems(selectedMenu.value._id, itemIds);
      menuItems.value = await menuStore.getMenuItems(selectedMenu.value._id, true);
      return true;
    } catch (error) {
      console.error('Failed to reorder menu items:', error);
      return false;
    }
  };

  return {
    showItemsModal,
    selectedMenu,
    menuItems,
    editingItem,
    openItemsModal,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    reorderItems
  };
} 