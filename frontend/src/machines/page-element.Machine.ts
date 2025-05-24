import { createMachine, assign } from 'xstate';
import type { PageElement } from '@/store/models/page/page-element.types';
import { usePageElementStore } from '@/store/page-element.store';

export interface PageElementContext {
  pageElements: PageElement[];
  selectedPageElement: PageElement | null;
  errorMessage: string | null;
  formData: {
    name: string;
    description: string;
    isRoot: boolean;
    displayOrder: number;
    page: string;
  };
}

export type PageElementEvent =
  | { type: 'FETCH' }
  | { type: 'CREATE' }
  | { type: 'EDIT'; pageElement: PageElement }
  | { type: 'DELETE'; pageElement: PageElement }
  | { type: 'BULK_DELETE'; pageElementIds: string[] }
  | { type: 'SAVE' }
  | { type: 'CANCEL' }
  | { type: 'RETRY' }
  | { type: 'DONE'; data: { pageElements: PageElement[] } }
  | { type: 'ERROR'; data: { message: string } };

  export type PageElementState =
  | { value: 'idle'; context: PageElementContext }
  | { value: 'loading'; context: PageElementContext }
  | { value: 'creating'; context: PageElementContext }
  | { value: 'editing'; context: PageElementContext }
  | { value: 'deleting'; context: PageElementContext }
  | { value: 'error'; context: PageElementContext }

export const createPageElementMachine = (initialContext: Partial<PageElementContext> = {}) => {
  const pageElementStore = usePageElementStore();

  return createMachine<PageElementContext, PageElementEvent, PageElementState>({
    id: 'pageElement',
    initial: 'idle',
    context: {
      pageElements: [],
      selectedPageElement: null,
      errorMessage: null,
      formData: {
        name: '',
        description: '',
        isRoot: true,
        displayOrder: 0,
        page: ''
      },
      ...initialContext
    },
    states: {
      idle: {
        on: {
          FETCH: 'loading',
          CREATE: 'creating',
          EDIT: 'editing',
          DELETE: 'deleting',
          BULK_DELETE: 'deleting'
        }
      },
      loading: {
        invoke: {
          src: 'fetchPageElements',
          onDone: {
            target: 'idle',
            actions: 'setPageElements'
          },
          onError: {
            target: 'error',
            actions: 'setError'
          }
        }
      },
      creating: {
        on: {
          SAVE: 'saving',
          CANCEL: 'idle'
        }
      },
      editing: {
        on: {
          SAVE: 'saving',
          CANCEL: 'idle'
        }
      },
      saving: {
        invoke: {
          src: 'savePageElement',
          onDone: {
            target: 'idle',
            actions: 'clearFormData'
          },
          onError: {
            target: 'error',
            actions: 'setError'
          }
        }
      },
      deleting: {
        invoke: {
          src: 'deletePageElement',
          onDone: {
            target: 'idle'
          },
          onError: {
            target: 'error',
            actions: 'setError'
          }
        }
      },
      error: {
        on: {
          RETRY: 'loading'
        }
      }
    }
  },
  {
    services: {
      fetchPageElements: async () => {
        const response = await pageElementStore.fetchPageElements();
        return response.pageElements;
      },
      savePageElement: async (context) => {
        const { formData, selectedPageElement } = context;
        if (selectedPageElement) {
          await pageElementStore.updatePageElement(selectedPageElement._id, formData as unknown as PageElement);
        } else {
          await pageElementStore.createPageElement(formData as unknown as PageElement);
        }
      },
      deletePageElement: async (context, event) => {
        if (event.type === 'BULK_DELETE') {
          await pageElementStore.bulkDeletePageElements(event.pageElementIds);
        } else {
          //await pageElementStore.deletePageElement(event.pageElement._id);
        }
      }
    },
    actions: {
      setPageElements: (context, event) => {
        if (event.type === 'DONE' && 'data' in event && 'pageElements' in event.data) {
          context.pageElements = event.data.pageElements;
        }
      },
      setError: (context, event) => {
        if (event.type === 'ERROR') {
          context.errorMessage = event.data.message;
        }
      },
      clearFormData: (context) => {
        context.formData = {
          name: '',
          description: '',
          isRoot: true,
          displayOrder: 0,
          page: ''
        };
        context.selectedPageElement = null;
      }
    }
  });
}