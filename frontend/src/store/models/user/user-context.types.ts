import type { User } from './user.types';

export interface UserContext {
  users: User[];
  selectedUser: User | null;
  errorMessage: string | null;
  isLoading: boolean;
  formData: Partial<User>;
} 