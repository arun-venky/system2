import type { Role, Permission } from '../role';
import type { User } from '../user/user.types';

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    permissions: Permission[];
    roles: Role[];
    sessionTimeout: number;
} 