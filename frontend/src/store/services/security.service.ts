import api from '../../utils/api';
import { SecuritySettings, AuditLogFilters } from '@/store/models';

export const securityService = {
  async getAuditLogs(filters: AuditLogFilters) {
    const response = await api.get('/security/logs', { params: filters });
    return response.data;
  },

  async getSecuritySettings() {
    const response = await api.get('/security/settings');
    return response.data;
  },

  async updateSecuritySettings(settings: Partial<SecuritySettings>) {
    const response = await api.put('/security/settings', settings);
    return response.data;
  }
}; 