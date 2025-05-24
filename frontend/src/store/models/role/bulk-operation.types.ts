export interface BulkOperation {
  action: 'create' | 'update' | 'delete';
  data?: any;
} 