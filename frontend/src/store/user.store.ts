import { defineStore } from 'pinia';
import type { UserState } from '@/store/models/user/user-state.types';
import type { UserFormData } from '@/store/models/user/user-form.types';
import api from '@/utils/api';

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    selectedUser: null,
    errorMessage: null,
    isLoading: false,
    formData: {}
  }),

  getters: {
    getUserByEmail: (state) => (email: string) => {
      return state.users.find(user => user.email === email) || null;
    }
  },

  actions: {
    async fetchUsers() {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await api.get('/users');
        const users = response.data;
        this.users = users;
        return users;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async getUserById(id: string) {
      try {
        const response = await api.get(`/users/${id}`);
        const user = response.data;
        this.selectedUser = user;
        return user;
      } catch (error) {
        console.error('User Error: Failed to get user', error);
        throw error;
      }
    },
    
    async createUser(userData: UserFormData) {
      try {
        // Validate required fields
        if (!userData.username || !userData.email || !userData.password) {
          throw new Error('Missing required fields');
        }
        const response = await api.post('/users', userData);
        const user = response.data;
        return user;
      } catch (error) {
        console.error('User Error: Failed to create user', error);
        throw error;
      }
    },
    
    async updateUser(id: string, userData: UserFormData) {
      try {
        // Validate that at least one field is being updated
        if (!userData.username && !userData.email && !userData.password) {
          throw new Error('No fields to update');
        }
        const response = await api.put(`/users/${id}`, userData);
        const user = response.data;
        return user;
      } catch (error) {
        console.error('User Error: Failed to update user', error);
        throw error;
      }
    },
    
    async deleteUser(id: string) {
      try {
        const response = await api.delete(`/users/${id}`);
        return response.data;
      } catch (error) {
        console.error('User Error: Failed to delete user', error);
        throw error;
      }
    },
    
    async verifyEmail(token: string) {
      try {
        const response = await api.post(`/users/verify-email/${token}`);
        return response.data;
      } catch (error) {
        console.error('User Error: Failed to verify email', error);
        throw error;
      }
    },
    
    async resendVerificationEmail(email: string) {
      try {
        const response = await api.post(`/users/resend-verification-email/${email}`);
        return response.data;
      } catch (error) {
        console.error('User Error: Failed to resend verification email', error);
        throw error;
      }
    },
    
    async changePassword(currentPassword: string, newPassword: string) {
      try {
        const response = await api.post(`/users/change-password`, { currentPassword, newPassword });
        return response.data;
      } catch (error) {
        console.error('User Error: Failed to change password', error);
        throw error;
      }
    },
    
    async requestPasswordReset(email: string) {
      try {
        const response = await api.post(`/users/request-password-reset`, { email });
        return response.data;
      } catch (error) {
        console.error('User Error: Failed to request password reset', error);
        throw error;
      }
    },
    
    async resetPassword(token: string, newPassword: string) {
      try {
        const response = await api.post(`/users/reset-password`, { token, newPassword });
        return response.data;
      } catch (error) {
        console.error('User Error: Failed to reset password', error);
        throw error;
      }
    },

    async getUserRoles(userId: string) {
      try {
        const response = await api.get(`/users/${userId}/roles`);
        return response.data.roles;
      } catch (error) {
        console.error('Error fetching user roles:', error);
        throw error;
      }
    },

    async assignRoles(userId: string, roleIds: string[]) {
      try {
        const response = await api.post(`/users/${userId}/roles`, { roleIds });
        return response.data;
      } catch (error) {
        console.error('Error assigning roles:', error);
        throw error;
      }
    },

    async removeRoles(userId: string, roleIds: string[]) {
      try {
        const response = await api.delete(`/users/${userId}/roles`, { data: { roleIds } });
        return response.data;
      } catch (error) {
        console.error('Error removing roles:', error);
        throw error;
      }
    },

    async bulkAssignRoles(userIds: string[], roleIds: string[]) {
      try {
        const response = await api.post('/users/bulk/roles', { userIds, roleIds });
        return response.data;
      } catch (error) {
        console.error('Error bulk assigning roles:', error);
        throw error;
      }
    }
  }
}); 