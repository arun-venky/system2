export interface AuditLog {
  ipAddress: any;
  _id: string;
  userId: string;
  action: string;
  resource: string;
  details: any;
  timestamp: string;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  userId?: string;
  action?: string;
  resource?: string;
  ipAddress?: string;
} 