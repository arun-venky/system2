import type { Role } from './role.types';
import type { Permission } from './permission.types';
import type { Resource } from '@/store/models/resource/resource.types';

export interface RoleState {
  roles: Role[];
  selectedRole: Role | null;
  errorMessage: string | null;
  isLoading: boolean;
  availableResources: Resource[];
  formData: {
    name: string;
    description?: string;
    permissions: Permission[];
  };
}