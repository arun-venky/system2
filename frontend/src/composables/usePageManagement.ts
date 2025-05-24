import { ref, computed } from 'vue';
import type { Page } from '@/store/models/page/page.types';
import type { PageElement } from '@/store/models/page/page-element.types';
import type { PageEvent } from '@/machines/pageMachine';
import { createPageMachine } from '@/machines/pageMachine';
import { useMachine } from '@xstate/vue';

export function usePageManagement() {
  const searchQuery = ref('');
  const selectedPages = ref<string[]>([]);
  const { state, send } = useMachine(createPageMachine());

  const filteredPages = computed(() => {
    const query = searchQuery.value.toLowerCase();
    return state.value.context.pages.filter(page => 
      page.name.toLowerCase().includes(query)
    );
  });

  const isCurrentState = (stateName: "idle" | "loading" | "creating" | "editing" | "deleting" | "error" | "managingElements" | "addingElement" | "deletingElement") => {
    return state.value.matches(stateName as any);
  };

  const raiseEvent = (event: PageEvent['type'], payload?: any) => {
    send({ type: event, ...payload });
  };

  const editPage = (page: Page) => {
    state.value.context.selectedPage = page;
    state.value.context.formData = {
      name: page.name,
      description: page.description || '',
      displayOrder: page.displayOrder || 0,
      pageElements: page.pageElements || []
    };
    raiseEvent('EDIT', { page });
  };

  const deletePage = (page: Page) => {
    raiseEvent('DELETE', { page });
  };

  const savePage = async () => {
    raiseEvent('SAVE');
  };

  const bulkDelete = () => {
    raiseEvent('BULK_DELETE', { pageIds: selectedPages.value });
  };

  const managePageElements = (page: Page) => {
    state.value.context.selectedPage = page;
    raiseEvent('MANAGE_ELEMENTS', { page });
  };

  const addElement = (page: Page) => {
    state.value.context.selectedPage = page;
    raiseEvent('ADD_ELEMENT', { page });
  };

  const editElement = (element: PageElement) => {
    state.value.context.selectedPageElement = element;
    raiseEvent('EDIT_ELEMENT', { element });
  };

  const saveElement = async () => {
    raiseEvent('SAVE_ELEMENT');
  };

  const deleteElement = (element: PageElement) => {
    raiseEvent('DELETE_ELEMENT', { element });
  };

  const handleAddElement = async () => {
    raiseEvent('SAVE_ELEMENT');
  };

  return {
    state,
    searchQuery,
    selectedPages,
    filteredPages,
    isCurrentState,
    raiseEvent,
    editPage,
    deletePage,
    savePage,
    bulkDelete,
    managePageElements,
    deleteElement,
    handleAddElement,
    addElement,
    editElement,
    saveElement
  };
}

