import { Permission } from './permission.types';

export interface Role {
  _id: string;
  name: string;
  permissions: Permission[];
  createdAt?: string;
  updatedAt?: string;
} 