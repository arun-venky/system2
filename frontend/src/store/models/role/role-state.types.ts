import { Role } from './role.types';
import { Permission } from './permission.types';

export interface RoleState {
  roles: Role[];
  selectedRole: Role | null;
  errorMessage: string | null;
  isLoading: boolean;
  formData: {
    name: string;
    permissions: Permission[];
  };
} 