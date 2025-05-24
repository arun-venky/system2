import type { MenuContext, MenuResponse, MenuFormData, Menu, Role } from '@/store/models';
import { useMenuStore } from '../store/menu.store'
import { createMachine, assign } from 'xstate'

// Define interfaces
export type MenuEvent =
  | { type: 'FETCH' }
  | { type: 'CREATE' }
  | { type: 'EDIT'; id: string }
  | { type: 'DELETE'; id: string }
  | { type: 'SAVE'; data: MenuFormData }
  | { type: 'CANCEL' }
  | { type: 'RETRY' }
  | { type: 'ADD_ITEM' }
  | { type: 'REMOVE_ITEM'; index: number }
  | { type: 'done.invoke.fetchData'; data: MenuResponse }
  | { type: 'error.platform.fetchData'; data: { message: string } }
  | { type: 'done.invoke.deleteMenu'; data: { message: string } }
  | { type: 'error.platform.deleteMenu'; data: { message: string } }

export type MenuState =
  | { value: 'idle'; context: MenuContext }
  | { value: 'loading'; context: MenuContext }
  | { value: 'creating'; context: MenuContext }
  | { value: 'editing'; context: MenuContext }
  | { value: 'deleting'; context: MenuContext }
  | { value: 'error'; context: MenuContext }

// Create menu management machine
export const createMenuMachine = (initialContext: Partial<MenuContext> = {}) => {
  const menuStore = useMenuStore();
  
  return createMachine<MenuContext, MenuEvent, MenuState>({
      id: 'menuManagement',
      initial: 'idle',
      context: {
        menus: [],
        roles: [],
        selectedMenu: null,
        errorMessage: null,
        isLoading: false,
        formData: { 
          name: '', 
          label: '',
          icon: '',
          slug: '',
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
              actions: ['selectMenu']
            },
            DELETE: { 
              target: 'deleting',
              actions: ['selectMenu']
            }
          }
        },
        loading: {
          entry: assign({ isLoading: true }),
          invoke: {
            src: 'fetchData',
            onDone: {
              target: 'idle',
              actions: ['setData']
            },
            onError: {
              target: 'error',
              actions: ['setError']
            }
          }
        },
        creating: {
          tags: ['creating'],
          entry: assign({ 
            formData: { 
              name: '', 
              label: '',
              icon: '',
              slug: '',
              displayOrder: 0
            },
            selectedMenu: null 
          }),
          on: {
            SAVE: { 
              target: 'loading',
              actions: ['createMenu']
            },
            CANCEL: { target: 'idle' }
          }
        },
        editing: {
          tags: ['editing'],
          entry: assign({
            formData: (context) => {
              if (context.selectedMenu) {
                return {
                  name: context.selectedMenu.name,
                  label: context.selectedMenu.label,
                  icon: context.selectedMenu.icon,
                  slug: context.selectedMenu.slug,
                  displayOrder: context.selectedMenu.displayOrder,
                  parent: context.selectedMenu.parent?._id,
                  pageElement: context.selectedMenu.pageElement?._id
                };
              }
              return context.formData;
            }
          }),
          on: {
            SAVE: { 
              target: 'loading',
              actions: ['updateMenu']
            },
            CANCEL: { target: 'idle' }
          }
        },
        deleting: {
          invoke: {
            src: 'deleteMenu',
            onDone: {
              target: 'idle',
              actions: ['removeMenu']
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
      fetchData: async () => {
        try {
          return await menuStore.fetchMenus()
        } catch (error) {
          console.error('Failed to fetch menus:', error)
          throw error
        }
      },
      deleteMenu: async (context) => {
        if (!context.selectedMenu?._id) {
          throw new Error('No menu selected')
        }
        try {
          return await menuStore.deleteMenu(context.selectedMenu._id)
        } catch (error) {
          console.error('Failed to delete menu:', error)
          throw error
        }
      },
      createMenu: async (context) => {
        try {
          return await menuStore.createMenu(context.formData as Partial<Menu>)
        } catch (error) {
          console.error('Failed to create menu:', error)
          throw error
        }
      },
      updateMenu: async (context) => {
        if (!context.selectedMenu?._id) {
          throw new Error('No menu selected')
        }
        try {
          return await menuStore.updateMenu(context.selectedMenu._id, context.formData as Partial<Menu>) 
        } catch (error) {
          console.error('Failed to update menu:', error)
          throw error
        }
      }
    },
    actions: {
      setData: assign({
        menus: (_, event) => {
          if ('data' in event && 'menus' in event.data) {
            return event.data.menus as Menu[] || []
          }
          return []
        },
        roles: (_, event) => {
          if ('data' in event && 'roles' in event.data) {
            return event.data.roles as unknown as Role[] || []
          }
          return []
        },
        isLoading: (_) => false,
        errorMessage: (_) => null
      }),
      selectMenu: assign({
        selectedMenu: (context, event) => {
          if ('id' in event) {
            return context.menus.find(menu => menu._id === event.id) || null
          }
          return null
        }
      }),
      removeMenu: assign({
        menus: (context) => {
          if (context.selectedMenu && context.selectedMenu._id) {
            return context.menus.filter(menu => menu._id !== context.selectedMenu?._id)
          }
          return context.menus
        },
        selectedMenu: (_) => null
      }),
      setError: assign({
        errorMessage: (_, event) => {
          if ('data' in event && 'message' in event.data) {
            const error = event.data.message || 'Operation failed'
            console.error('Menu Error:', error)
            return error
          }
          console.error('Menu Error: Operation failed')
          return 'Operation failed'
        },
        isLoading: (_) => false
      })
    }
  });
}