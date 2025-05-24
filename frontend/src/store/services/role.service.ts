import api from '../../utils/api';
import { Role, Permission, BulkOperation } from '@/store/models';

export const roleService = {
  async fetchRoles() {
    const response = await api.get('/roles');
    return response.data;
  },

  async getRoleById(id: string) {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  async createRole(roleData: Partial<Role>) {
    const response = await api.post('/roles', roleData);
    return response.data;
  },

  async updateRole(id: string, roleData: Partial<Role>) {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data;
  },

  async deleteRole(id: string) {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },

  async manageRoles(operations: BulkOperation[]) {
    const response = await api.post('/roles/manage', { operations });
    return response.data;
  },

  async getRoleUsers(id: string) {
    const response = await api.get(`/roles/${id}/users`);
    return response.data;
  },

  async assignRoleToUsers(roleId: string, userIds: string[]) {
    const response = await api.post(`/roles/${roleId}/users`, { userIds });
    return response.data;
  },

  async removeRoleFromUsers(roleId: string, userIds: string[]) {
    const response = await api.delete(`/roles/${roleId}/users`, { data: { userIds } });
    return response.data;
  },

  async getRolePermissions(id: string) {
    const response = await api.get(`/roles/${id}/permissions`);
    return response.data;
  },

  async updateRolePermissions(roleId: string, permissions: Permission[]) {
    const response = await api.put(`/roles/${roleId}/permissions`, { permissions });
    return response.data;
  },

  async duplicateRole(id: string, newName: string) {
    const response = await api.post(`/roles/${id}/duplicate`, { name: newName });
    return response.data;
  }
}; 