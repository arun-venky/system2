export interface Permission {
  resource: string;
  actions: string[];
  newAction?: string;
} 