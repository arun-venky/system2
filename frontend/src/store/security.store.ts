import { defineStore } from 'pinia';
import { SecuritySettings, SecurityState, AuditLog, AuditLogFilters } from '@/store/models';
import { securityService } from './services/security.service';

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
        const response = await securityService.getAuditLogs(filters);
        this.auditLogs = response.logs;
        this.pagination = {
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
          totalCount: response.count
        };
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
        const response = await securityService.getSecuritySettings();
        this.settings = response;
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
        const response = await securityService.updateSecuritySettings(settings);
        this.settings = response.settings;
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