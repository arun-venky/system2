import { ref, computed } from 'vue';
import type { SecuritySettings, AuditLog, AuditLogFilters } from '@/store/models';
import { useMachine } from '@xstate/vue';
import { createSecurityMachine } from '../machines/securityMachine';

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90
  },
  sessionPolicy: {
    maxConcurrentSessions: 1,
    sessionTimeout: 30,
    requireReauth: true
  },
  mfaPolicy: {
    enabled: false,
    methods: ['email', 'authenticator'],
    required: false
  },
  ipWhitelist: {
    enabled: false,
    ips: []
  }
};

export function useSecurityManagement() {
  const { state, send } = useMachine(createSecurityMachine());
  const showSettingsModal = ref(false);
  const showAuditLogModal = ref(false);
  const selectedSettings = ref<SecuritySettings>({ ...DEFAULT_SECURITY_SETTINGS });
  const auditLogs = ref<AuditLog[]>([]);
  const auditLogFilters = ref<AuditLogFilters>({
    startDate: undefined,
    endDate: undefined,
    action: undefined,
    userId: undefined,
    ipAddress: undefined,
    page: 1,
    limit: 10
  });

  // Computed properties
  const isLoading = computed(() => state.value.matches('loading'));
  const hasError = computed(() => state.value.matches('error'));
  const errorMessage = computed(() => state.value.context.errorMessage);
  const currentSettings = computed(() => state.value.context.settings);
  const currentAuditLogs = computed(() => state.value.context.auditLogs);

  const isCurrentState = (stateName: "idle" | "loading" | "creating" | "editing" | "deleting" | "error") => 
    state.value.hasTag(stateName);

  const raiseEvent = (event: string, data?: any) => {
    send({ type: event, ...data });
  };

  // Security Settings Management
  const openSettingsModal = async () => {
    try {
      send('FETCH');
      // Wait for the state to update
      await new Promise(resolve => setTimeout(resolve, 100));

      selectedSettings.value = state.value.context.settings 
      ? { ...state.value.context.settings }
      : { ...DEFAULT_SECURITY_SETTINGS };      
      
      showSettingsModal.value = true;
    } catch (error) {
      console.error('Failed to fetch security settings:', error);
      send({ type: 'ERROR', error });
    }
  };

  const updateSecuritySettings = async (settings: Partial<SecuritySettings>) => {
    try {
      send({ type: 'UPDATE_SETTINGS', settings });
      // Wait for the state to update
      await new Promise(resolve => setTimeout(resolve, 100));
      showSettingsModal.value = false;
    } catch (error) {
      console.error('Failed to update security settings:', error);
      send({ type: 'ERROR', error });
    }
  };

  // Audit Log Management
  const openAuditLogModal = async () => {
    try {
      console.log('openAuditLogModal', auditLogFilters.value);
      send({ type: 'GET_AUDIT_LOGS', filters: auditLogFilters.value });
      // Wait for the state to update
      await new Promise(resolve => setTimeout(resolve, 100));
      if (state.value.context.errorMessage) {
        throw new Error(state.value.context.errorMessage);
      }
      auditLogs.value = state.value.context.auditLogs || [];
      console.log('auditLogs', auditLogs.value);
      showAuditLogModal.value = true;
    } catch (error: any) {
      console.error('Failed to fetch audit logs:', error);
      if (error.code === 'ECONNABORTED') {
        send({ type: 'ERROR', error: new Error('Request timed out. Please try again.') });
      } else if (error.response?.status >= 500) {
        send({ type: 'ERROR', error: new Error('Server error. Please try again later.') });
      } else {
        send({ type: 'ERROR', error });
      }
    }
  };

  const applyAuditLogFilters = async () => {
    try {
      // Reset to first page when applying new filters
      auditLogFilters.value.page = 1;
      send({ type: 'GET_AUDIT_LOGS', filters: auditLogFilters.value });
      // Wait for the state to update
      await new Promise(resolve => setTimeout(resolve, 100));
      if (state.value.context.errorMessage) {
        throw new Error(state.value.context.errorMessage);
      }
      auditLogs.value = state.value.context.auditLogs;
    } catch (error: any) {
      console.error('Failed to apply audit log filters:', error);
      if (error.code === 'ECONNABORTED') {
        send({ type: 'ERROR', error: new Error('Request timed out. Please try again.') });
      } else if (error.response?.status >= 500) {
        send({ type: 'ERROR', error: new Error('Server error. Please try again later.') });
      } else {
        send({ type: 'ERROR', error });
      }
    }
  };

  const clearAuditLogFilters = () => {
    auditLogFilters.value = {
      startDate: undefined,
      endDate: undefined,
      action: undefined,
      userId: undefined,
      ipAddress: undefined,
      page: 1,
      limit: 10
    };
    applyAuditLogFilters();
  };

  const loadMoreLogs = async () => {
    try {
      const nextPage = state.value.context.pagination.page + 1;
      if (nextPage > state.value.context.pagination.totalPages) {
        return;
      }
      auditLogFilters.value.page = nextPage;
      send({ type: 'GET_AUDIT_LOGS', filters: auditLogFilters.value });
      // Wait for the state to update
      await new Promise(resolve => setTimeout(resolve, 100));
      if (state.value.context.errorMessage) {
        throw new Error(state.value.context.errorMessage);
      }
      auditLogs.value = [...auditLogs.value, ...state.value.context.auditLogs];
    } catch (error: any) {
      console.error('Failed to load more logs:', error);
      if (error.code === 'ECONNABORTED') {
        send({ type: 'ERROR', error: new Error('Request timed out. Please try again.') });
      } else if (error.response?.status >= 500) {
        send({ type: 'ERROR', error: new Error('Server error. Please try again later.') });
      } else {
        send({ type: 'ERROR', error });
      }
    }
  };

  // Export functionality
  const exportAuditLogs = async () => {
    try {
      const exportFilters = {
        ...auditLogFilters.value,
        limit: 1000 // Export more logs
      };
      send({ type: 'GET_AUDIT_LOGS', filters: exportFilters });
      const logs = currentAuditLogs.value;
      
      const csvContent = convertLogsToCSV(logs);
      downloadCSV(csvContent, 'audit-logs.csv');
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      send({ type: 'ERROR', error });
    }
  };

  // Helper functions
  const convertLogsToCSV = (logs: AuditLog[]) => {
    const headers = ['Timestamp', 'User ID', 'Action', 'Resource', 'Details', 'IP Address'];
    const rows = logs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.userId,
      log.action,
      log.resource,
      JSON.stringify(log.details),
      log.ipAddress
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    // State
    state,
    isLoading,
    hasError,
    errorMessage,
    showSettingsModal,
    showAuditLogModal,
    selectedSettings,
    auditLogs,
    auditLogFilters,
    currentSettings,
    currentAuditLogs,

    // Methods
    isCurrentState,
    raiseEvent,
    openSettingsModal,
    updateSecuritySettings,
    openAuditLogModal,
    applyAuditLogFilters,
    clearAuditLogFilters,
    loadMoreLogs,
    exportAuditLogs
  };
} 