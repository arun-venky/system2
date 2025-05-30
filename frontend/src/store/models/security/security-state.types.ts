import type { SecuritySettings } from './security-settings.types';
import type { AuditLog } from './audit-log.types';

export interface SecurityState {
  settings: SecuritySettings | null;
  auditLogs: AuditLog[];
  errorMessage: string | null;
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  };
} 