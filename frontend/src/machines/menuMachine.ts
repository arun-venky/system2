import { MenuItem, MenuContext, MenuResponse } from '@/store/models';
import { useMenuStore } from '../store/menu.store'
import { createMachine, assign } from 'xstate'

// Define interfaces
export type MenuEvent =
  | { type: 'FETCH' }
  | { type: 'CREATE' }
  | { type: 'EDIT'; id: string }
  | { type: 'DELETE'; id: string }
  | { type: 'SAVE'; data: any }
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
        description: '',
        isActive: false,
        isPublic: false,
        items: [] 
      },
      menuItems: [],
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
            description: '',
            isActive: false,
            isPublic: false,
            items: [] 
          },
          selectedMenu: null 
        }),
        on: {
          SAVE: { 
            target: 'loading',
            actions: ['createMenu']
          },
          CANCEL: { target: 'idle' },
          ADD_ITEM: {
            actions: ['addMenuItem']
          },
          REMOVE_ITEM: {
            actions: ['removeMenuItem']
          }
        }
      },
      editing: {
        entry: assign({
          formData: (context) => ({ 
            name: context.selectedMenu?.name || '',
            items: context.selectedMenu?.items || [],
            description: context.selectedMenu?.description || '',
            isActive: context.selectedMenu?.isActive || false,
            isPublic: context.selectedMenu?.isPublic || false
          })
        }),
        on: {
          SAVE: { 
            target: 'loading',
            actions: ['updateMenu']
          },
          CANCEL: { target: 'idle' },
          ADD_ITEM: {
            actions: ['addMenuItem']
          },
          REMOVE_ITEM: {
            actions: ['removeMenuItem']
          }
        }
      },
      deleting: {
        invoke: {
          src: 'deleteMenu',
          onDone: {
            target: 'loading',
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
    actions: {
      setData: assign({
        menus: (_, event) => {
          if ('data' in event) {
            return event.data.menus || []
          }
          return []
        },
        roles: (_, event) => {
          if ('data' in event) {
            return event.data.roles || []
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
      addMenuItem: assign({
        formData: (context) => {
          const newItem: MenuItem = {
            label: '',
            url: '',
            roles: [],
            order: context.formData.items.length
          }
          return {
            ...context.formData,
            items: [...context.formData.items, newItem]
          }
        }
      }),
      removeMenuItem: assign({
        formData: (context, event) => {
          if ('index' in event) {
            return {
              ...context.formData,
              items: context.formData.items.filter((_: MenuItem, index: number) => index !== event.index)
            }
          }
          return context.formData
        }
      }),
      setError: assign({
        errorMessage: (_, event) => {
          if ('data' in event) {
            const error = event.data.message || 'Operation failed'
            console.error('Menu Error:', error)
            return error
          }
          console.error('Menu Error: Operation failed')
          return 'Operation failed'
        },
        isLoading: (_) => false
      }),
      createMenu: async (context) => {
        return await menuStore.createMenu(context.formData)
      },
      updateMenu: async (context) => {
        if (context.selectedMenu?._id) {
          return await menuStore.updateMenu(context.selectedMenu._id, context.formData)
        }
        throw new Error('No menu selected')
      }
    },
    services: {
      fetchData: async () => {
        return await menuStore.fetchMenus()
      },
      deleteMenu: async (context) => {
        if (context.selectedMenu?._id) {
          return await menuStore.deleteMenu(context.selectedMenu._id)
        }
        throw new Error('No menu selected')
      },
      createMenu: async (context) => {
        return await menuStore.createMenu(context.formData)
      },
      updateMenu: async (context) => {
        if (context.selectedMenu?._id) {
          return await menuStore.updateMenu(context.selectedMenu._id, context.formData)
        }
        throw new Error('No menu selected')
      }
    }
  })
}