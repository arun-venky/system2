export interface AuthContext {
    user: any | null;
    errorMessage: string | null;
    redirectTo: string | null;
    tokenExpiry: number | null;
    isNetworkError: boolean;
} 