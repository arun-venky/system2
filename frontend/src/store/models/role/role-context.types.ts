import type { Role } from './role.types';
import type { Permission } from './permission.types';

export interface RoleContext {
  roles: Role[];
  selectedRole: Role | null;
  errorMessage: string | null;
  isLoading: boolean;
  formData: {
    name: string;
    description?: string;
    permissions: Permission[];
  };
} 