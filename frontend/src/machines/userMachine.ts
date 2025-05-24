import { UserContext } from '@/store/models';
import { useUserStore } from '../store/user.store'
import { createMachine, assign } from 'xstate'

// Define interfaces
export type UserEvent =
  | { type: 'FETCH' }
  | { type: 'CREATE' }
  | { type: 'EDIT'; id: string }
  | { type: 'DELETE'; id: string }
  | { type: 'SAVE'; data: any }
  | { type: 'CANCEL' }
  | { type: 'RETRY' }

export type UserState =
  | { value: 'idle'; context: UserContext }
  | { value: 'loading'; context: UserContext }
  | { value: 'creating'; context: UserContext }
  | { value: 'editing'; context: UserContext }
  | { value: 'deleting'; context: UserContext }
  | { value: 'error'; context: UserContext }

// Create user management machine
export const createUserMachine = (initialContext: Partial<UserContext> = {}) => {
  const userStore = useUserStore();
  
  return createMachine<UserContext, UserEvent, UserState>({
    id: 'userManagement',
    initial: 'idle',
    context: {
      users: [],
      selectedUser: null,
      errorMessage: null,
      isLoading: false,
      formData: {},
      ...initialContext
    },
    states: {
      idle: {
        on: {
          FETCH: { target: 'loading' },
          CREATE: { target: 'creating' },
          EDIT: { 
            target: 'editing',
            actions: ['selectUser']
          },
          DELETE: { 
            target: 'deleting',
            actions: ['selectUser']
          }
        }
      },
      loading: {
        entry: assign({ isLoading: true }),
        invoke: {
          src: 'fetchUsers',
          onDone: {
            target: 'idle',
            actions: ['setUsers']
          },
          onError: {
            target: 'error',
            actions: ['setError']
          }
        }
      },
      creating: {
        entry: assign({ 
          formData: {},
          selectedUser: null 
        }),
        on: {
          SAVE: { 
            target: 'loading',
            actions: ['createUser']
          },
          CANCEL: { target: 'idle' }
        }
      },
      editing: {
        entry: assign({
          formData: (context) => ({ ...context.selectedUser })
        }),
        on: {
          SAVE: { 
            target: 'loading',
            actions: ['updateUser']
          },
          CANCEL: { target: 'idle' }
        }
      },
      deleting: {
        invoke: {
          src: 'deleteUser',
          onDone: {
            target: 'loading',
            actions: ['removeUser']
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
      setUsers: assign({
        users: (_, event) => {
          if ('data' in event) {
            return event.data.users || []
          }
          return []
        },
        isLoading: (_) => false,
        errorMessage: (_) => null
      }),
      selectUser: assign({
        selectedUser: (context, event) => {
          if ('id' in event) {
            return context.users.find(user => user._id === event.id) || null
          }
          return null
        }
      }),
      removeUser: assign({
        users: (context) => {
          if (context.selectedUser && context.selectedUser._id) {
            return context.users.filter(user => user._id !== context.selectedUser?._id)
          }
          return context.users
        },
        selectedUser: (_) => null
      }),
      setError: assign({
        errorMessage: (_, event) => {
          if ('data' in event) {
            const error = event.data.message || 'Operation failed'
            console.error('User Error:', error)
            return error
          }
          console.error('User Error: Operation failed')
          return 'Operation failed'
        },
        isLoading: (_) => false
      }),
    },
    services: {
      fetchUsers: async () => {
        return await userStore.fetchUsers();
      },
      createUser: async (context) => {
        return await userStore.createUser(context.formData);
      },
      updateUser: async (context) => {
        if (!context.selectedUser?._id) {
          throw new Error('No user selected');
        }
        return await userStore.updateUser(context.selectedUser._id, context.formData);
      },
      deleteUser: async (context) => {
        if (!context.selectedUser?._id) {
          throw new Error('No user selected');
        }
        return await userStore.deleteUser(context.selectedUser._id);
      }
    }
  })
}