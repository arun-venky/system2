import { ref, computed } from 'vue';
import { Menu } from '@/store/models';
import { useMenuStore } from '../store/menu.store'
import { useMachine } from '@xstate/vue';
import { createMenuMachine } from '../machines/menuMachine';

export function useMenuManagement() {
  const menuStore = useMenuStore();
  const { state, send } = useMachine(createMenuMachine());
  const searchQuery = ref('');
  const selectedMenus = ref<string[]>([]);
  const showBulkActions = ref(false);

  const filteredMenus = computed(() => {
    if (!searchQuery.value) return state.value.context.menus;
    const query = searchQuery.value.toLowerCase();
    return state.value.context.menus.filter((menu: { name: string; description: string; }) => 
      menu.name.toLowerCase().includes(query) ||
      menu.description?.toLowerCase().includes(query)
    );
  });

  const isCurrentState = (stateName: "idle" | "loading" | "creating" | "editing" | "deleting" | "error") => 
    state.value.matches(stateName);

  const raiseEvent = (event: string, data?: any) => {
    send({ type: event, ...data });
  };

  const editMenu = (menu: Menu) => {
    raiseEvent('EDIT', { id: menu._id });
  };

  const deleteMenu = (menu: Menu) => {
    raiseEvent('DELETE', { id: menu._id });
  };

  const confirmDelete = () => {
    raiseEvent('CONFIRM_DELETE');
  };

  const saveMenu = () => {
    raiseEvent('SAVE');
  };

  const bulkDelete = async () => {
    if (!selectedMenus.value.length) return;
    try {
      await menuStore.bulkDelete(selectedMenus.value);
      selectedMenus.value = [];
      showBulkActions.value = false;
      raiseEvent('FETCH');
    } catch (error) {
      console.error('Failed to delete menus:', error);
    }
  };

  return {
    state,
    searchQuery,
    selectedMenus,
    showBulkActions,
    filteredMenus,
    isCurrentState,
    raiseEvent,
    editMenu,
    deleteMenu,
    confirmDelete,
    saveMenu,
    bulkDelete
  };
} 