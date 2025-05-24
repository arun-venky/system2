import { createMachine, assign } from 'xstate';
import { usePageStore } from '../store/page.store';
import type { Page } from '@/store/models';
import type { PageContext } from '@/store/models/page/page-context.types';
import type { PageElement } from '@/store/models/page/page-element.types';

// Define interfaces
export type PageEvent =
  | { type: 'FETCH' }
  | { type: 'CREATE' }
  | { type: 'EDIT'; id: string }
  | { type: 'DELETE'; id: string }
  | { type: 'BULK_DELETE'; ids: string[] }
  | { type: 'CONFIRM_DELETE' }
  | { type: 'SAVE' }
  | { type: 'CANCEL' }
  | { type: 'RETRY' } 
  | { type: 'MANAGE_ELEMENTS'; pageElements: PageElement[] }
  | { type: 'ADD_ELEMENT' }
  | { type: 'EDIT_ELEMENT'; element: PageElement }
  | { type: 'DELETE_ELEMENT'; element: PageElement }
  | { type: 'SAVE_ELEMENT' }
  | { type: 'UPDATE_ELEMENT'; element: PageElement }
  | { type: 'REORDER_ELEMENTS'; elements: PageElement[] }
  | { type: 'DONE'; data: { pages: Page[], pageElements: PageElement[] } }
  | { type: 'ERROR'; data: { message: string } };

export type PageState =
  | { value: 'idle'; context: PageContext }
  | { value: 'loading'; context: PageContext }
  | { value: 'creating'; context: PageContext }
  | { value: 'editing'; context: PageContext }
  | { value: 'deleting'; context: PageContext }
  | { value: 'error'; context: PageContext }
  | { value: 'managingElements'; context: PageContext }
  | { value: 'addingElement'; context: PageContext }
  | { value: 'editingElement'; context: PageContext }
  | { value: 'savingElement'; context: PageContext }
  | { value: 'deletingElement'; context: PageContext };

// Create page management machine
export const createPageMachine = (initialContext: Partial<PageContext> = {}) => {
  const pageStore = usePageStore();
  
  return createMachine<PageContext, PageEvent, PageState>({
    id: 'pageManagement',
    initial: 'idle',
    context: {
      pages: [],
      pageElements: [],
      selectedPage: null,
      selectedPageElement: null,
      errorMessage: null,
      isLoading: false,
      formData: {
        name: '',
        description: '',
        displayOrder: 0,
        pageElements: []
      },
      pageElementFormData: {
        name: '',
        description: '',
        isRoot: true,
        displayOrder: 0
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
          },
          BULK_DELETE: { target: 'deleting' },
          MANAGE_ELEMENTS: { target: 'managingElements', actions: ['selectPage'] }
        }
      },
      loading: {
        entry: assign({ isLoading: true }),
        invoke: {
          src: 'fetchPages',
          onDone: {
            target: 'idle',
            actions: assign({
              pages: (_, event) => event.data,
              isLoading: false,
              errorMessage: null
            })
          },
          onError: {
            target: 'error',
            actions: assign({
              errorMessage: (_, event) => event.data.message,
              isLoading: false
            })
          }
        }
      },
      creating: {
        entry: assign({ 
          formData: { 
            name: '', 
            description: '',
            displayOrder: 0,
            pageElements: []
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
            name: context.selectedPage?.name || '',
            description: context.selectedPage?.description || '',
            displayOrder: context.selectedPage?.displayOrder || 0,
            pageElements: context.selectedPage?.pageElements || []
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
      managingElements: {
        on: {
          ADD_ELEMENT: 'addingElement',
          DELETE_ELEMENT: 'deletingElement',
          UPDATE_ELEMENT: {
            target: 'managingElements',
            actions: ['updateElement']
          },
          REORDER_ELEMENTS: {
            target: 'managingElements',
            actions: ['reorderElements']
          },
          CANCEL: 'idle'
        },
        invoke: {
          src: 'fetchPageElements',
          onDone: {
            target: 'managingElements',
            actions: ['setPageElements']
          },
          onError: {
            target: 'error',
            actions: 'setError'
          }
        }
      },
      addingElement: {
        on: {
          SAVE_ELEMENT: 'savingElement',
          CANCEL: 'managingElements'
        }
      },
      editingElement: {
        on: {
          SAVE_ELEMENT: 'savingElement',
          CANCEL: 'managingElements'
        }
      },
      savingElement: {
        invoke: {
          src: 'savePageElement',
          onDone: {
            target: 'managingElements',
            actions: 'clearPageElementFormData'
          },
          onError: {
            target: 'error',
            actions: 'setError'
          }
        }
      },
      deletingElement: {
        invoke: {
          src: 'deletePageElement',
          onDone: {
            target: 'managingElements'
          },
          onError: {
            target: 'error',
            actions: 'setError'
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
          const response = await pageStore.fetchPages();
          return response.pages;
        } catch (error) {
          throw { message: error instanceof Error ? error.message : 'Failed to fetch pages' };
        }
      },
      savePage: async (context) => {
        const { formData, selectedPage } = context;
        if (selectedPage) {
          try {
            await pageStore.updatePage(selectedPage._id, formData);
          } catch (error) {
            throw { message: error instanceof Error ? error.message : 'Failed to update page' };
          }
        } else {
          try {
            await pageStore.createPage(formData);
          } catch (error) {
            throw { message: error instanceof Error ? error.message : 'Failed to create page' };
          }
        }
      },
      deletePage: async (context) => {
        if (!context.selectedPage?._id) {
          throw new Error('No page selected for deletion');
        }
        try {
          await pageStore.deletePage(context.selectedPage._id);
        } catch (error) {
          throw { message: error instanceof Error ? error.message : 'Failed to delete page' };
        }
      },
      fetchPageElements: async (context) => {
        if (!context.selectedPage?._id) {
          console.log('No page selected for fetching elements');
          throw new Error('No page selected for fetching elements');
        }
        try {
          const response = await pageStore.fetchPageElements(context.selectedPage._id);
          return response.pageElements;
        } catch (error) { 
          throw { message: error instanceof Error ? error.message : 'Failed to fetch page elements' };  
        }
      },
      savePageElement: async (context) => {
        if (context.pageElementFormData.isRoot) {
          await pageStore.createPageElement(context.pageElementFormData);
        } else {
          const elementId = (context.pageElementFormData as PageElement)._id;
          await pageStore.updatePageElement(elementId, context.pageElementFormData);
        }
      },
      deletePageElement: async (context) => {
        if (!context.selectedPageElement?._id) {
          throw new Error('No page element selected for deleting');
        }
        await pageStore.deletePageElement(context.selectedPageElement._id);
      }
    },
    actions: {
      setError: assign({
        errorMessage: (_, event) => {
          if (event.type === 'ERROR') {
            const error = event.data.message;
            console.error('Page error:', error);
            return error;
          }
          console.error('Page Error: Operation failed');
          return 'Operation failed';
        },
        isLoading: (_) => false
      }),
      selectPage: assign({
        selectedPage: (context, event) => {
          if ('page' in event) {
            return context.pages.find(page => page._id === (event.page as Page)._id) || null;
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
      setPageElements: (context, event) => {
        console.log('setPageElements', context, event);
        if (context.selectedPage && 'data' in event) {
          const pageElements = event.data as unknown as PageElement[];          
          console.log('setting pageElements', context);
          if (pageElements && pageElements.length > 0) {
            context.pageElements = pageElements;
            context.pageElementFormData = {          
              name: pageElements[0].name || '',
              description: pageElements[0].description || '', 
              isRoot: pageElements[0].isRoot || true,
              displayOrder: pageElements[0].displayOrder || 0
            };
          }
        }
      },
      clearPageElements: (context) => {
        console.log('clearPageElements', context);
        context.pageElements = [];
      },
      clearFormData: (context) => {
        console.log('clearFormData', context);
        context.formData = {
          name: '',
          description: '',
          displayOrder: 0,
          pageElements: []
        };
        context.selectedPage = null;
      },
      clearPageElementFormData: (context) => {
        console.log('clearPageElementFormData', context);
        context.pageElementFormData = {
          name: '',
          description: '',
          isRoot: true,
          displayOrder: 0
        };
        context.selectedPageElement = null;
      },
      createPage: async (context) => {
        try {
          await pageStore.createPage(context.formData);
        } catch (error) {
          throw { message: error instanceof Error ? error.message : 'Failed to create page' };
        }
      },
      updatePage: async (context) => {
        if (!context.selectedPage?._id) {
          throw new Error('No page selected for update');
        }
        try {
          await pageStore.updatePage(context.selectedPage._id, context.formData);
        } catch (error) {
          throw { message: error instanceof Error ? error.message : 'Failed to update page' };
        }
      },
      updateElement: assign({
        selectedPage: (context, event) => {
          if (event.type === 'UPDATE_ELEMENT' && context.selectedPage) {
            const updatedElements = context.selectedPage.pageElements.map(element => 
              element._id === event.element._id ? event.element : element
            );
            return {
              ...context.selectedPage,
              pageElements: updatedElements
            };
          }
          return context.selectedPage;
        }
      }),
      reorderElements: assign({
        selectedPage: (context, event) => {
          if (event.type === 'REORDER_ELEMENTS' && context.selectedPage) {
            return {
              ...context.selectedPage,
              pageElements: event.elements
            };
          }
          return context.selectedPage;
        }
      })
    }
  });
};