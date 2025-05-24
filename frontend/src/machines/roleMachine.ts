import type { RoleContext } from '@/store/models';
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
  | { type: 'UPDATE_FORM'; [key: string]: any }
  | { type: 'ADD_ACTION'; permissionIndex: number; action: string }
  | { type: 'REMOVE_ACTION'; permissionIndex: number; action: string }
  | { type: 'ADD_RESOURCE'; resource: string }
  | { type: 'REMOVE_RESOURCE'; resourceIndex: number }
  | { type: 'VIEW_USERS'; id: string }
  | { type: 'ASSIGN_USERS'; userIds: string[] }
  | { type: 'REMOVE_USERS'; userIds: string[] };

export type RoleState =
  | { value: 'idle'; context: RoleContext }
  | { value: 'loading'; context: RoleContext }
  | { value: 'creating'; context: RoleContext }
  | { value: 'editing'; context: RoleContext }
  | { value: 'deleting'; context: RoleContext }
  | { value: 'updating'; context: RoleContext }
  | { value: 'viewing_users'; context: RoleContext }
  | { value: 'assigning_users'; context: RoleContext }
  | { value: 'error'; context: RoleContext };

// Create role management machine
export const createRoleMachine = (initialContext: Partial<RoleContext> = {}) => {
  const roleStore = useRoleStore();
  
  return createMachine<RoleContext, RoleEvent, RoleState>({
    id: 'roleManagement',
    initial: 'loading',
    context: {
      roles: [],
      selectedRole: null,
      errorMessage: null,
      isLoading: false,
      formData: {
        name: '',
        description: '',
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
          },
          VIEW_USERS: {
            target: 'viewing_users',
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
          formData: { 
            name: '', 
            description: '',
            permissions: []
          },
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
          },
          ADD_ACTION: {
            actions: ['addAction']
          },
          REMOVE_ACTION: {
            actions: ['removeAction']
          },
          ADD_RESOURCE: {
            actions: ['addResource']
          },
          REMOVE_RESOURCE: {
            actions: ['removeResource']
          }
        }
      },
      editing: {
        entry: assign({ 
          formData: (context) => ({
            name: context.selectedRole?.name || '',
            description: context.selectedRole?.description || '',
            permissions: context.selectedRole?.permissions || []
          })
        }),
        on: {
          SAVE: { 
            target: 'updating'
          },
          CANCEL: { target: 'idle' },
          UPDATE_FORM: {
            actions: ['updateFormData']
          },
          ADD_ACTION: {
            actions: ['addAction']
          },
          REMOVE_ACTION: {
            actions: ['removeAction']
          },
          ADD_RESOURCE: {
            actions: ['addResource']
          },
          REMOVE_RESOURCE: {
            actions: ['removeResource']
          }
        }
      },
      updating: {
        invoke: {
          src: 'updateRole',
          onDone: {
            target: 'loading',
            actions: ['updateRole']
          },
          onError: {
            target: 'error',
            actions: ['setError']
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
      viewing_users: {
        invoke: {
          src: 'fetchRoleUsers',
          onDone: {
            target: 'viewing_users',
            actions: ['setRoleUsers']
          },
          onError: {
            target: 'error',
            actions: ['setError']
          }
        },
        on: {
          ASSIGN_USERS: {
            target: 'assigning_users',
            actions: ['assignUsers']
          },
          REMOVE_USERS: {
            target: 'assigning_users',
            actions: ['removeUsers']
          },
          CANCEL: { target: 'idle' }
        }
      },
      assigning_users: {
        invoke: {
          src: 'updateRoleUsers',
          onDone: {
            target: 'viewing_users',
            actions: ['setRoleUsers']
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
      setRoles: assign({
        roles: (_, event) => {
          if ('data' in event) {
            console.log('Setting roles:', event.data);
            return event.data;
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
      }),
      updateRole: async (context) => {
        if (!context.selectedRole?._id) {
          throw new Error('No role selected for update');
        }
        if (!context.formData.name) {
          throw new Error('Role name is required');
        }

        // Validate and clean permissions
        const validActions = ['create', 'read', 'update', 'delete'];
        const validResources = ['users', 'pages', 'menus', 'roles', 'security'];
        
        const cleanedPermissions = context.formData.permissions
          .filter(permission => validResources.includes(permission.resource))
          .map(permission => ({
            resource: permission.resource,
            actions: permission.actions.filter(action => validActions.includes(action))
          }));

        const cleanedFormData = {
          name: context.formData.name,
          description: context.formData.description || '',
          permissions: cleanedPermissions
        };

        console.log('Updating role with data:', cleanedFormData);
        const response = await roleStore.updateRole(context.selectedRole._id, cleanedFormData);
        console.log('Role updated:', response);
        return response;
      },
      addAction: assign({
        formData: (context, event) => {
          if ('permissionIndex' in event && 'action' in event) {
            const permissions = [...context.formData.permissions];
            if (!permissions[event.permissionIndex].actions) {
              permissions[event.permissionIndex].actions = [];
            }
            // Only add the action if it doesn't already exist
            if (!permissions[event.permissionIndex].actions.includes(event.action)) {
              permissions[event.permissionIndex].actions.push(event.action);
            }
            return {
              ...context.formData,
              permissions
            };
          }
          return context.formData;
        }
      }),
      removeAction: assign({
        formData: (context, event) => {
          if ('permissionIndex' in event && 'action' in event) {
            const permissions = [...context.formData.permissions];
            const actionIndex = permissions[event.permissionIndex].actions.indexOf(event.action);
            if (actionIndex > -1) {
              permissions[event.permissionIndex].actions.splice(actionIndex, 1);
            }
            return {
              ...context.formData,
              permissions
            };
          }
          return context.formData;
        }
      }),
      addResource: assign({
        formData: (context, event) => {
          if ('resource' in event) {
            const permissions = [...context.formData.permissions];
            // Only add the resource if it doesn't already exist
            if (!permissions.some(p => p.resource === event.resource)) {
              permissions.push({
                resource: event.resource,
                actions: []
              });
            }
            return {
              ...context.formData,
              permissions
            };
          }
          return context.formData;
        }
      }),
      removeResource: assign({
        formData: (context, event) => {
          if ('resourceIndex' in event) {
            const permissions = [...context.formData.permissions];
            permissions.splice(event.resourceIndex, 1);
            return {
              ...context.formData,
              permissions
            };
          }
          return context.formData;
        }
      }),
      createRole: async (context) => {
        if (!context.formData.name) {
          throw new Error('Role name is required');
        }

        // Validate and clean permissions
        const validActions = ['create', 'read', 'update', 'delete'];
        const validResources = ['users', 'pages', 'menus', 'roles', 'security'];
        
        const cleanedPermissions = context.formData.permissions
          .filter(permission => validResources.includes(permission.resource))
          .map(permission => ({
            resource: permission.resource,
            actions: permission.actions.filter(action => validActions.includes(action))
          }));

        const cleanedFormData = {
          name: context.formData.name,
          description: context.formData.description || '',
          permissions: cleanedPermissions
        };

        console.log('Creating role with data:', cleanedFormData);
        const response = await roleStore.createRole(cleanedFormData);
        console.log('Role created:', response);
        return response;
      },
      deleteRole: async (context) => {
        if (!context.selectedRole?._id) {
          throw new Error('No role selected for deletion');
        }
        return await roleStore.deleteRole(context.selectedRole._id);
      },
      setRoleUsers: assign({
        roleUsers: (_, event) => {
          if ('data' in event) {
            return event.data.users || [];
          }
          return [];
        }
      }),
      assignUsers: assign({
        pendingUserIds: (_, event) => {
          if ('userIds' in event) {
            return event.userIds;
          }
          return [];
        }
      }),
      removeUsers: assign({
        pendingUserIds: (_, event) => {
          if ('userIds' in event) {
            return event.userIds;
          }
          return [];
        }
      })
    },
    services: {
      fetchRoles: async () => {
        console.log('Fetching roles...');
        const roles = await roleStore.fetchRoles();
        console.log('Fetched roles:', roles);
        return roles;
      },
      createRole: async (context) => {
        if (!context.formData.name) {
          throw new Error('Role name is required');
        }

        // Validate and clean permissions
        const validActions = ['create', 'read', 'update', 'delete'];
        const validResources = ['users', 'pages', 'menus', 'roles', 'security'];
        
        const cleanedPermissions = context.formData.permissions
          .filter(permission => validResources.includes(permission.resource))
          .map(permission => ({
            resource: permission.resource,
            actions: permission.actions.filter(action => validActions.includes(action))
          }));

        const cleanedFormData = {
          name: context.formData.name,
          description: context.formData.description || '',
          permissions: cleanedPermissions
        };

        console.log('Creating role with data:', cleanedFormData);
        const response = await roleStore.createRole(cleanedFormData);
        console.log('Role created:', response);
        return response;
      },
      updateRole: async (context) => {
        if (!context.selectedRole?._id) {
          throw new Error('No role selected for update');
        }
        if (!context.formData.name) {
          throw new Error('Role name is required');
        }

        // Validate and clean permissions
        const validActions = ['create', 'read', 'update', 'delete'];
        const validResources = ['users', 'pages', 'menus', 'roles', 'security'];
        
        const cleanedPermissions = context.formData.permissions
          .filter(permission => validResources.includes(permission.resource))
          .map(permission => ({
            resource: permission.resource,
            actions: permission.actions.filter(action => validActions.includes(action))
          }));

        const cleanedFormData = {
          name: context.formData.name,
          description: context.formData.description || '',
          permissions: cleanedPermissions
        };

        console.log('Updating role with data:', cleanedFormData);
        const response = await roleStore.updateRole(context.selectedRole._id, cleanedFormData);
        console.log('Role updated:', response);
        return response;
      },
      deleteRole: async (context) => {
        if (!context.selectedRole?._id) {
          throw new Error('No role selected for deletion');
        }
        return await roleStore.deleteRole(context.selectedRole._id);
      },
      fetchRoleUsers: async (context) => {
        if (!context.selectedRole?._id) {
          throw new Error('No role selected');
        }
        return await roleStore.getRoleUsers(context.selectedRole._id);
      },
      updateRoleUsers: async (context, event) => {
        if (!context.selectedRole?._id) {
          throw new Error('No role selected');
        }
        if (event.type === 'ASSIGN_USERS') {
          return await roleStore.assignRoleToUsers(context.selectedRole._id, event.userIds);
        } else if (event.type === 'REMOVE_USERS') {
          return await roleStore.removeRoleFromUsers(context.selectedRole._id, event.userIds);
        }
        throw new Error('Invalid user operation');
      }
    }
  });
};