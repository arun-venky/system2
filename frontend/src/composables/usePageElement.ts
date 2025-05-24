import { ref, computed } from 'vue';
import type { PageElement } from '@/store/models/page/page-element.types';
import { createPageElementMachine, type PageElementEvent } from '@/machines/page-element.Machine';
import { useMachine } from '@xstate/vue';

export function usePageElementManagement() {
  const searchQuery = ref('');
  const selectedPageElements = ref<string[]>([]);

  const { state, send } = useMachine(createPageElementMachine());

  const filteredPageElements = computed(() => {
    const query = searchQuery.value.toLowerCase();
    return state.value.context.pageElements.filter((element: { name: string; description: string; }) => 
      element.name.toLowerCase().includes(query) ||
      element.description.toLowerCase().includes(query)
    );
  });

  const isCurrentState = (stateName: "idle" | "loading" | "creating" | "editing" | "deleting" | "error") => {
    return state.value.matches(stateName);
  };

  const raiseEvent = (event: PageElementEvent['type'], payload?: any) => { 
    send({ type: event, ...payload });
  };

  const editPageElement = (pageElement: PageElement) => {
    state.value.context.selectedPageElement = pageElement;
    state.value.context.formData = {
      name: pageElement.name,
      description: pageElement.description,
      isRoot: pageElement.isRoot,
      displayOrder: pageElement.displayOrder,
      page: pageElement.page._id
    };
    raiseEvent('EDIT', { pageElement });
  };

  const deletePageElement = (pageElement: PageElement) => {
    raiseEvent('DELETE', { pageElement });
  };

  const savePageElement = async () => {
    raiseEvent('SAVE');
  };

  const bulkDelete = () => {
    raiseEvent('BULK_DELETE', { pageElementIds: selectedPageElements.value });
  };

  return {
    state,
    searchQuery,
    selectedPageElements,
    filteredPageElements,
    isCurrentState,
    raiseEvent,
    editPageElement,
    deletePageElement,
    savePageElement,
    bulkDelete
  };
} 