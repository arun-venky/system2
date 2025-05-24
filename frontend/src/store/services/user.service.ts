import api from '../../utils/api';
import { User, UserFormData } from '@/store/models';

export const userService = {
  async fetchUsers() {
    const response = await api.get('/users');
    return response.data;
  },

  async getUserById(id: string) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(userData: UserFormData) {
    const response = await api.post('/users', userData);
    return response.data;
  },

  async updateUser(id: string, userData: UserFormData) {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async verifyEmail(token: string) {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  async resendVerificationEmail(email: string) {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  async updateProfile(userData: Partial<User>) {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  async requestPasswordReset(email: string) {
    const response = await api.post('/auth/request-password-reset', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  }
}; 