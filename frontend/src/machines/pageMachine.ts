import { createMachine, assign } from 'xstate';
import { usePageStore } from '../store/page.store';
import { Page } from '@/store/models';

// Define interfaces
export interface PageContext {
  pages: Page[];
  selectedPage: Page | null;
  errorMessage: string | null;
  isLoading: boolean;
  formData: {
    title: string;
    content: string;
    slug: string;
    parentId: string;
  };
}

export type PageEvent =
  | { type: 'FETCH' }
  | { type: 'CREATE' }
  | { type: 'EDIT'; id: string }
  | { type: 'DELETE'; id: string }
  | { type: 'CONFIRM_DELETE' }
  | { type: 'SAVE' }
  | { type: 'CANCEL' }
  | { type: 'RETRY' }
  | { type: 'DONE'; data: { pages: Page[] } }
  | { type: 'ERROR'; data: { message: string } };

export type PageState =
  | { value: 'idle'; context: PageContext }
  | { value: 'loading'; context: PageContext }
  | { value: 'creating'; context: PageContext }
  | { value: 'editing'; context: PageContext }
  | { value: 'deleting'; context: PageContext }
  | { value: 'error'; context: PageContext };

// Create page management machine
export const createPageMachine = (initialContext: Partial<PageContext> = {}) => {
  const pageStore = usePageStore();
  
  return createMachine<PageContext, PageEvent, PageState>({
    id: 'pageManagement',
    initial: 'idle',
    context: {
      pages: [],
      selectedPage: null,
      errorMessage: null,
      isLoading: false,
      formData: {
        title: '',
        content: '',
        slug: '',
        parentId: '',
      },
      ...initialContext
    },
    states: {
      idle: {
        on: {
          FETCH: { target: 'loading' },
          CREATE: { target: 'creating' },
          EDIT: { 
            target: 'editing',
            actions: ['selectPage']
          },
          DELETE: { 
            target: 'deleting',
            actions: ['selectPage']
          }
        }
      },
      loading: {
        entry: assign({ isLoading: true }),
        invoke: {
          src: 'fetchPages',
          onDone: {
            target: 'idle',
            actions: ['setPages']
          },
          onError: {
            target: 'error',
            actions: ['setError']
          }
        }
      },
      creating: {
        entry: assign({ 
          formData: { 
            title: '', 
            content: '', 
            slug: '',
            parentId: '',
          },
          selectedPage: null 
        }),
        on: {
          SAVE: { 
            target: 'loading',
            actions: ['createPage']
          },
          CANCEL: { target: 'idle' }
        }
      },
      editing: {
        entry: assign({
          formData: (context) => ({
            title: context.selectedPage?.title || '',
            content: context.selectedPage?.content || '',
            slug: context.selectedPage?.slug || '',
            parentId: context.selectedPage?.parentId || '',
          })
        }),
        on: {
          SAVE: { 
            target: 'loading',
            actions: ['updatePage']
          },
          CANCEL: { target: 'idle' }
        }
      },
      deleting: {
        entry: assign({ isLoading: true }),
        invoke: {
          src: 'deletePage',
          onDone: {
            target: 'idle',
            actions: ['removePage']
          },
          onError: {
            target: 'error',
            actions: ['setError']
          }
        }
      },
      error: {
        on: {
          RETRY: { target: 'loading' },
          CANCEL: { target: 'idle' }
        }
      }
    }
  }, {
    services: {
      fetchPages: async () => {
        try {
          return await pageStore.fetchPages();
        } catch (error) {
          throw error;
        }
      },
      deletePage: async (context) => {
        if (!context.selectedPage?._id) {
          throw new Error('No page selected for deletion');
        }
        try {
          await pageStore.deletePage(context.selectedPage._id);
        } catch (error) {
          throw error;
        }
      }
    },
    actions: {
      setPages: assign({
        pages: (_, event) => {
          if (event.type === 'DONE') {
            return event.data.pages;
          }
          return [];
        },
        isLoading: (_) => false,
        errorMessage: (_) => null
      }),
      selectPage: assign({
        selectedPage: (context, event) => {
          if ('id' in event) {
            return context.pages.find(page => page._id === event.id) || null;
          }
          return null;
        }
      }),
      removePage: assign({
        pages: (context) => {
          if (context.selectedPage && context.selectedPage._id) {
            return context.pages.filter(page => page._id !== context.selectedPage?._id);
          }
          return context.pages;
        },
        selectedPage: (_) => null,
        isLoading: (_) => false,
        errorMessage: (_) => null
      }),
      setError: assign({
        errorMessage: (_, event) => {
          if (event.type === 'ERROR') {
            const error = event.data.message;
            console.error('Page Error:', error);
            return error;
          }
          console.error('Page Error: Operation failed');
          return 'Operation failed';
        },
        isLoading: (_) => false
      }),
      createPage: async (context) => {
        try {
          await pageStore.createPage(context.formData);
        } catch (error) {
          throw error;
        }
      },
      updatePage: async (context) => {
        if (!context.selectedPage?._id) {
          throw new Error('No page selected for update');
        }
        try {
          await pageStore.updatePage(context.selectedPage._id, context.formData);
        } catch (error) {
          throw error;
        }
      }
    }
  });
};