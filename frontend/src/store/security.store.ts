import { defineStore } from 'pinia';
import type { SecuritySettings, SecurityState } from '@/store/models';
import type { AuditLog, AuditLogFilters } from '@/store/models/security/audit-log.types';
import api from '@/utils/api';

export const useSecurityStore = defineStore('security', {
  state: (): SecurityState => ({
    settings: null,
    auditLogs: [] as AuditLog[],
    errorMessage: null,
    isLoading: false,
    pagination: {
      page: 1,
      limit: 10,
      totalPages: 0,
      totalCount: 0
    }
  }),

  getters: {
    hasMoreLogs: (state) => state.pagination.page < state.pagination.totalPages
  },

  actions: {
    async getAuditLogs(filters: AuditLogFilters) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await api.get('/security/logs', { params: filters });
        if (response.data) {
          this.auditLogs = response.data.logs;
          this.pagination = {
            page: response.data.page,
            limit: response.data.limit,
            totalPages: response.data.totalPages,
            totalCount: response.data.count
          };
        }
        return response;
      } catch (error: any) {
        if (error.code === 'ECONNABORTED') {
          this.errorMessage = 'Request timed out. Please try again.';
        } else if (error.response?.status >= 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else {
          this.errorMessage = error instanceof Error ? error.message : 'Failed to fetch audit logs';
        }
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async getSecuritySettings() {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await api.get('/security/settings');
        if (response.data) {
          this.settings = response.data;
        }
        return response;
      } catch (error: any) {
        if (error.code === 'ECONNABORTED') {
          this.errorMessage = 'Request timed out. Please try again.';
        } else if (error.response?.status >= 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else {
          this.errorMessage = error instanceof Error ? error.message : 'Failed to fetch security settings';
        }
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async updateSecuritySettings(settings: Partial<SecuritySettings>) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await api.put('/security/settings', settings);
        if (response.data) {
          this.settings = response.data;
        }
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to update security settings';
        throw error;
      } finally {
        this.isLoading = false;
      }
    }    
  }
}); 