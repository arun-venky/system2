import { defineStore } from 'pinia';
import { Role, RoleState, Permission, BulkOperation } from '@/store/models';
import { roleService } from './services/role.service';

export const useRoleStore = defineStore('role', {
  state: (): RoleState => ({
    roles: [],
    selectedRole: null,
    errorMessage: null,
    isLoading: false,
    formData: {
      name: '',
      permissions: [] as Permission[]
    }
  }),

  getters: {    
    getRoleByName: (state) => (name: string) => {
      return state.roles.find(role => role.name === name) || null;
    }
  },

  actions: {
    async fetchRoles() {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await roleService.fetchRoles();
        this.roles = response.roles;
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to fetch roles';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async getRoleById(id: string) {
      try {
        return await roleService.getRoleById(id);
      } catch (error) {
        throw error;
      }
    },
    
    async getRoleUsers(id: string) {
      try {
        return await roleService.getRoleUsers(id);
      } catch (error) {
        throw error;
      }
    },
    
    async getRolePermissions(id: string) {
      try {
        return await roleService.getRolePermissions(id);
      } catch (error) {
        throw error;
      }
    },
    
    async createRole(roleData: Partial<Role>) {
      try {
        if (!roleData.name) {
          throw new Error('Role name is required');
        }
        return await roleService.createRole(roleData);
      } catch (error) {
        throw error;
      }
    },
    
    async updateRole(id: string, roleData: Partial<Role>) {
      try {
        return await roleService.updateRole(id, roleData);
      } catch (error) {
        throw error;
      }
    },
    
    async deleteRole(id: string) {
      try {
        return await roleService.deleteRole(id);
      } catch (error) {
        throw error;
      }
    },
    
    async manageRoles(operations: BulkOperation[]) {
      try {
        return await roleService.manageRoles(operations);
      } catch (error) {
        throw error;
      }
    },
    
    async assignRoleToUsers(roleId: string, userIds: string[]) {
      try {
        if (!userIds.length) {
          throw new Error('At least one user ID is required');
        }
        return await roleService.assignRoleToUsers(roleId, userIds);
      } catch (error) {
        throw error;
      }
    },
    
    async removeRoleFromUsers(roleId: string, userIds: string[]) {
      try {
        return await roleService.removeRoleFromUsers(roleId, userIds);
      } catch (error) {
        throw error;
      }
    },
    
    async updateRolePermissions(roleId: string, permissions: Permission[]) {
      try {
        return await roleService.updateRolePermissions(roleId, permissions);
      } catch (error) {
        throw error;
      }
    },
    
    async duplicateRole(roleId: string, newName: string) {
      try {
        return await roleService.duplicateRole(roleId, newName);
      } catch (error) {
        throw error;
      }
    } 
  }
}); 