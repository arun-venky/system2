import { RoleContext } from '@/store/models';
import { useRoleStore } from '../store/role.store'
import { createMachine, assign } from 'xstate';

// Define interfaces
export type RoleEvent =
  | { type: 'FETCH' }
  | { type: 'CREATE' }
  | { type: 'EDIT'; id: string }
  | { type: 'DELETE'; id: string }
  | { type: 'SAVE' }
  | { type: 'CANCEL' }
  | { type: 'CONFIRM_DELETE' }
  | { type: 'RETRY' }
  | { type: 'UPDATE_FORM'; [key: string]: any };

export type RoleState =
  | { value: 'idle'; context: RoleContext }
  | { value: 'loading'; context: RoleContext }
  | { value: 'creating'; context: RoleContext }
  | { value: 'editing'; context: RoleContext }
  | { value: 'deleting'; context: RoleContext }
  | { value: 'error'; context: RoleContext };

// Create role management machine
export const createRoleMachine = (initialContext: Partial<RoleContext> = {}) => {
  const roleStore = useRoleStore();
  
  return createMachine<RoleContext, RoleEvent, RoleState>({
    id: 'roleManagement',
    initial: 'idle',
    context: {
      roles: [],
      selectedRole: null,
      errorMessage: null,
      isLoading: false,
      formData: {
        name: '',
        permissions: []
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
            actions: ['selectRole']
          },
          DELETE: { 
            target: 'deleting',
            actions: ['selectRole']
          }
        }
      },
      loading: {
        entry: assign({ isLoading: true }),
        invoke: {
          src: 'fetchRoles',
          onDone: {
            target: 'idle',
            actions: ['setRoles']
          },
          onError: {
            target: 'error',
            actions: ['setError']
          }
        }
      },
      creating: {
        entry: assign({ 
          formData: { name: '', permissions: [] },
          selectedRole: null 
        }),
        on: {
          SAVE: { 
            target: 'loading',
            actions: ['createRole']
          },
          CANCEL: { target: 'idle' },
          UPDATE_FORM: {
            actions: ['updateFormData']
          }
        }
      },
      editing: {
        entry: assign({
          formData: (context) => ({ 
            name: context.selectedRole?.name || '',
            permissions: context.selectedRole?.permissions || []
          })
        }),
        on: {
          SAVE: { 
            target: 'loading',
            actions: ['updateRole']
          },
          CANCEL: { target: 'idle' },
          UPDATE_FORM: {
            actions: ['updateFormData']
          }
        }
      },
      deleting: {
        invoke: {
          src: 'deleteRole',
          onDone: {
            target: 'loading',
            actions: ['removeRole']
          },
          onError: {
            target: 'error',
            actions: ['setError']
          }
        },
        on: {
          CANCEL: { target: 'idle' }
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
      setRoles: assign({
        roles: (_, event) => {
          if ('data' in event) {
            return event.data.roles || [];
          }
          return [];
        },
        isLoading: (_) => false,
        errorMessage: (_) => null
      }),
      selectRole: assign({
        selectedRole: (context, event) => {
          if ('id' in event) {
            return context.roles.find(role => role._id === event.id) || null;
          }
          return null;
        }
      }),
      removeRole: assign({
        roles: (context) => {
          if (context.selectedRole && context.selectedRole._id) {
            return context.roles.filter(role => role._id !== context.selectedRole?._id);
          }
          return context.roles;
        },
        selectedRole: (_) => null
      }),
      updateFormData: assign({
        formData: (context, event) => {
          if ('type' in event && event.type === 'UPDATE_FORM') {
            return {
              ...context.formData,
              ...event
            };
          }
          return context.formData;
        }
      }),
      setError: assign({
        errorMessage: (_, event) => {
          if ('data' in event && event.data) {
            const error = event.data.message || 'Operation failed';
            console.error('Role Error:', error);
            return error;
          }
          console.error('Role Error: Operation failed');
          return 'Operation failed';
        },
        isLoading: (_) => false
      })
    },
    services: {
      fetchRoles: async () => {
        return await roleStore.fetchRoles();
      },
      createRole: async (context) => {
        if (!context.formData.name) {
          throw new Error('Role name is required');
        }
        return await roleStore.createRole(context.formData);
      },
      updateRole: async (context) => {
        if (!context.selectedRole?._id) {
          throw new Error('No role selected for update');
        }
        if (!context.formData.name) {
          throw new Error('Role name is required');
        }
        return await roleStore.updateRole(context.selectedRole._id, context.formData);
      },
      deleteRole: async (context) => {
        if (!context.selectedRole?._id) {
          throw new Error('No role selected for deletion');
        }
        return await roleStore.deleteRole(context.selectedRole._id);
      }
    }
  });
};