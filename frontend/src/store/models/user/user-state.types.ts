import type { User } from './user.types';

export interface UserState {
  users: User[];
  selectedUser: User | null;
  errorMessage: string | null;
  isLoading: boolean;
  formData: Partial<User>;
} 