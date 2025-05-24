import type { SecuritySettings, AuditLog, AuditLogFilters } from '@/store/models';
import { useSecurityStore } from '../store/security.store'
import { createMachine, assign } from 'xstate';

// Types
interface SecurityContext {
  recentLogs: any;
  settings: SecuritySettings | null;
  auditLogs: AuditLog[];
  errorMessage: string | null;
  isLoading: boolean;
  filters: AuditLogFilters | null;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  };
}

type SecurityEvent =
  | { type: 'FETCH' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<SecuritySettings> }
  | { type: 'GET_AUDIT_LOGS'; filters: Partial<AuditLogFilters> }
  | { type: 'ERROR'; error: any }
  | { type: 'RETRY' };

type SecurityState =
  | { value: 'idle'; context: SecurityContext }
  | { value: 'loading'; context: SecurityContext }
  | { value: 'editing'; context: SecurityContext }
  | { value: 'gettingLogs'; context: SecurityContext }
  | { value: 'error'; context: SecurityContext };

// Create security management machine
export const createSecurityMachine = (initialContext: Partial<SecurityContext> = {}) => {
  const securityStore = useSecurityStore();

  return createMachine<SecurityContext, SecurityEvent, SecurityState>({
    id: 'securityManagement',
    initial: 'idle',
    context: {
      recentLogs: [],
      settings: null,
      auditLogs: [],
      errorMessage: null,
      isLoading: false,
      filters: null,
      pagination: {
        page: 1,
        limit: 10,
        totalPages: 0,
        totalCount: 0
      },
      ...initialContext
    },
    states: {
      idle: {
        on: {
          FETCH: { target: 'loading' },
          UPDATE_SETTINGS: { target: 'editing' },
          GET_AUDIT_LOGS: { target: 'gettingLogs' }
        }
      },
      loading: {
        entry: assign({ isLoading: true }),
        invoke: {
          src: 'getAuditLogs',
          onDone: {
            target: 'idle',
            actions: ['setAuditLogs']
          },
          onError: {
            target: 'error',
            actions: ['setError']
          }
        }
      },
      editing: {
        invoke: {          
          src: 'editSecuritySettings',
          onDone: {
            target: 'idle',
            actions: assign({
              settings: (_, event) => event.data,
              isLoading: false,
              errorMessage: null
            })
          },
          onError: {
            target: 'error',
            actions: assign({
              errorMessage: (_, event) => event.data?.message || 'Failed to update security settings',
              isLoading: false
            })
          }
        }  
      },
      gettingLogs: {
        invoke: {          
          src: 'getAuditLogs',
          onDone: {
            target: 'idle',
            actions: assign({
              auditLogs: (_, event) => event.data.logs || [],
              pagination: (_, event) => ({
                page: event.data.page || 1,
                limit: event.data.limit || 10,
                totalPages: event.data.totalPages || 0,
                totalCount: event.data.count || 0
              }),
              isLoading: false,
              errorMessage: null
            })
          },
          onError: {
            target: 'error',
            actions: assign({
              errorMessage: (_, event) => event.data?.message || 'Failed to fetch audit logs',
              isLoading: false
            })
          }
        }  
      },
      error: {
        on: {
          RETRY: { target: 'loading' },
          FETCH: { target: 'loading' },
          UPDATE_SETTINGS: { target: 'loading' },
          GET_AUDIT_LOGS: { target: 'loading' }
        }
      }
    }
  },
  {
    services: {
      getAuditLogs: async (context, event) => {
        if ('filters' in event) {
          return await securityStore.getAuditLogs(event.filters);
        }
        throw new Error('No filters provided');
      },
      getSecuritySettings: async () => {
        return await securityStore.getSecuritySettings();
      },
      editSecuritySettings: async (context, event) => {
        if (event.type !== 'UPDATE_SETTINGS') return;
        return await securityStore.updateSecuritySettings(event.settings);
      }
    }
  });
};