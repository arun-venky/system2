import { defineStore } from 'pinia';
import type { Role } from '@/store/models/role/role.types';
import type { RoleState } from '@/store/models/role/role-state.types';
import type { Permission } from '@/store/models/role/permission.types';
import type { BulkOperation } from '@/store/models/role/bulk-operation.types';

import api from '@/utils/api';

export const useRoleStore = defineStore('role', {
  state: (): RoleState => ({
    roles: [],
    selectedRole: null,
    errorMessage: null,
    isLoading: false,
    availableResources: [],
    formData: {
      name: '',
      description: '',
      permissions: [] as Permission[]
    }
  }),

  getters: {    
    getRoleByName: (state) => (name: string) => {
      return state.roles.find((role: { name: string; }) => role.name === name) || null;
    }
  },

  actions: {
    async fetchRoles() {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await api.get('/roles');
        const { roles } = response.data;
        this.roles = roles;
        return roles;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to fetch roles';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async getRoleById(id: string) {
      try {
        const response = await api.get(`/roles/${id}`);
        const role = response.data;
        this.selectedRole = role;
        this.formData = {
          name: role.name,
          description: role.description || '',
          permissions: role.permissions || []
        };
        return role;
      } catch (error) {
        throw error;
      }
    },
    
    async getRoleUsers(id: string) {
      try {
        const response = await api.get(`/roles/${id}/users`);
        console.log('Role users response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching role users:', error);
        throw error;
      }
    },
    
    async getRolePermissions(id: string) {
      try {
        const response = await api.get(`/roles/${id}/permissions`);
        const permissions = response.data;
        return permissions;
      } catch (error) {
        throw error;
      }
    },
    
    async createRole(roleData: Partial<Role>) {
      try {
        if (!roleData.name) {
          throw new Error('Role name is required');
        }
        console.log('Creating role with data:', roleData);
        const response = await api.post('/roles', roleData);
        console.log('Create role response:', response.data);
        
        // Add the new role to the roles array
        const newRole = response.data.role;
        this.roles = [...this.roles, newRole];
        
        return newRole;
      } catch (error) {
        console.error('Error creating role:', error);
        this.errorMessage = error instanceof Error ? error.message : 'Failed to create role';
        throw error;
      }
    },
    
    async updateRole(roleId: string, data: Partial<Role>) {
      try {
        console.log('Store updating role with data:', data);
        const response = await api.put(`/roles/${roleId}`, data);
        console.log('Update response:', response.data);
        
        // Ensure roles is an array
        if (!Array.isArray(this.roles)) {
          console.error('Roles is not an array:', this.roles);
          const { roles } = await this.fetchRoles();
          this.roles = roles;
        }
        
        // Update the role in the array
        const updatedRole = response.data.role;
        this.roles = this.roles.map(role => 
          role._id === roleId ? updatedRole : role
        );
        
        return updatedRole;
      } catch (error) {
        console.error('Error updating role:', error);
        this.errorMessage = error instanceof Error ? error.message : 'Failed to update role';
        throw error;
      }
    },
    
    async deleteRole(id: string) {
      try {
        const response = await api.delete(`/roles/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    async manageRoles(operations: BulkOperation[]) {
      try {
        const response = await api.post('/roles/manage', { operations });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    async assignRoleToUsers(roleId: string, userIds: string[]) {
      try {
        if (!userIds.length) {
          throw new Error('At least one user ID is required');
        }
        const response = await api.post(`/roles/${roleId}/users`, { userIds });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    async removeRoleFromUsers(roleId: string, userIds: string[]) {
      try {
        const response = await api.delete(`/roles/${roleId}/users`, { data: { userIds } });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    async updateRolePermissions(roleId: string, permissions: Permission[]) {
      try {
        const response = await api.put(`/roles/${roleId}/permissions`, { permissions });
        return response.data;
      } catch (error) {
        throw error;
      }
    },  

    async fetchAvailableResources() {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await api.get('/pages/resources');
        this.availableResources = response.data.resources;
        return response.data.resources;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to fetch available resources';
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
}); 