import type { AxiosError } from 'axios'
import type { AuthContext, AuthResponse } from '@/store/models';
import { useAuthStore } from '../store/auth.store'
import { createMachine, assign } from 'xstate'

// Define interfaces
interface ErrorResponse {
  message: string
  [key: string]: any
}

export type AuthEvent =
  | { type: 'LOGIN'; email: string; password: string }
  | { type: 'SIGNUP'; username: string; email: string; password: string }
  | { type: 'LOGOUT' }
  | { type: 'RETRY' }
  | { type: 'CANCEL' }
  | { type: 'CHECK_TOKEN' }
  | { type: 'TOKEN_EXPIRED' }
  | { type: 'SESSION_WARNING' }
  | { type: 'done.invoke.loginService'; data: AuthResponse }
  | { type: 'done.invoke.signupService'; data: AuthResponse }
  | { type: 'error.platform.loginService'; data: { message: string } }
  | { type: 'error.platform.signupService'; data: { message: string } }

export type AuthState =
  | { value: 'idle'; context: AuthContext }
  | { value: 'authenticating'; context: AuthContext }
  | { value: 'registering'; context: AuthContext }
  | { value: 'authenticated'; context: AuthContext }
  | { value: 'error'; context: AuthContext }

// Create authentication machine            
export const createAuthMachine = (initialContext: Partial<AuthContext> = {}) => {
  const authStore = useAuthStore()

  return createMachine<AuthContext, AuthEvent, AuthState>({
    id: 'auth',
    initial: 'idle',
    context: {
      user: null,
      errorMessage: null,
      redirectTo: null,
      tokenExpiry: null,
      isNetworkError: false,
      ...initialContext
    },
    states: {
      idle: {
        on: {
          LOGIN: { target: 'authenticating' },
          SIGNUP: { target: 'registering' },
          CHECK_TOKEN: { target: 'checkingToken' }
        }
      },
      checkingToken: {
        invoke: {
          src: 'checkTokenService',
          onDone: {
            target: 'authenticated',
            actions: ['setUser']
          },
          onError: {
            target: 'idle',
            actions: ['clearUser']
          }
        }
      },
      authenticating: {
        invoke: {
          src: 'loginService',
          onDone: {
            target: 'authenticated',
            actions: ['setUser', 'redirectAfterLogin']
          },
          onError: {
            target: 'error',
            actions: 'setError'
          }
        },
        on: {
          CANCEL: { target: 'idle' }
        }
      },
      registering: {
        invoke: {
          src: 'signupService',
          onDone: {
            target: 'authenticated',
            actions: ['setUser', 'redirectAfterLogin']
          },
          onError: {
            target: 'error',
            actions: 'setError'
          }
        },
        on: {
          CANCEL: { target: 'idle' }
        }
      },
      authenticated: {
        entry: ['startTokenRefresh', 'startSessionWarning'],
        exit: ['stopTokenRefresh', 'stopSessionWarning'],
        on: {
          LOGOUT: {
            target: 'idle',
            actions: 'clearUser'
          },
          TOKEN_EXPIRED: {
            target: 'idle',
            actions: ['clearUser', 'setTokenExpiredError']
          },
          SESSION_WARNING: {
            target: 'authenticated',
            actions: 'showSessionWarning'
          }
        }
      },
      error: {
        entry: ['checkNetworkError'],
        on: {
          RETRY: [
            { 
              target: 'authenticating',
              cond: (_, event) => event.type === 'RETRY' && !!sessionStorage.getItem('lastLoginAttempt')
            },
            { 
              target: 'registering',
              cond: (_, event) => event.type === 'RETRY' && !!sessionStorage.getItem('lastSignupAttempt')
            },
            { target: 'idle' }
          ],
          LOGIN: { target: 'authenticating' },
          SIGNUP: { target: 'registering' },
          CANCEL: { target: 'idle' }
        }
      }
    }
  }, {
    actions: {
      setUser: assign({
        user: (_, event) => {
          if ('data' in event && event.data) {
            const { token, refreshToken, user } = event.data as AuthResponse
            authStore.setAuth({ user, token, refreshToken })
            sessionStorage.removeItem('lastLoginAttempt')
            sessionStorage.removeItem('lastSignupAttempt')
            return user
          }
          return null
        },
        tokenExpiry: (_, event) => {
          if ('data' in event && event.data) {
            const { token } = event.data as AuthResponse
            const tokenData = JSON.parse(atob(token.split('.')[1]))
            return tokenData.exp * 1000 // Convert to milliseconds
          }
          return null
        },
        errorMessage: (_) => null
      }),
      setTokenExpiredError: assign({
        errorMessage: (_) => 'Your session has expired. Please log in again.'
      }),
      startTokenRefresh: (context) => {
        if (context.tokenExpiry) {
          const timeUntilExpiry = context.tokenExpiry - Date.now()
          if (timeUntilExpiry > 0) {
            setTimeout(() => {
              // This will be handled by the component using the machine
              window.dispatchEvent(new CustomEvent('tokenExpired'))
            }, timeUntilExpiry)
          }
        }
      },
      stopTokenRefresh: () => {
        // Clear any existing timeouts
        window.dispatchEvent(new CustomEvent('clearTokenRefresh'))
      },
      setError: assign({
        errorMessage: (_, event) => {
          if ('data' in event && event.data) {
            const error = event.data as AxiosError<ErrorResponse>
            console.error('Auth Error:', event.data)
            console.error('Auth Error:', error.response?.data)
            console.error('Auth Error:', error)

            // Handle network errors
            if (error.name === 'AxiosError' && error.code === 'ERR_NETWORK') {
              return 'Unable to connect to the server. Please check your internet connection and try again.'
            }

            // Handle timeout errors
            if (error.name === 'AxiosError' && error.code === 'ECONNABORTED') {
              return 'Request timed out. Please try again.'
            }

            // Handle server errors
            if (error.response?.status && error.response.status >= 500) {
              return 'Server error. Please try again later.'
            }

            // Handle authentication errors
            if (error.response?.status === 401) {
              return 'Invalid email or password.'
            }

            // Handle validation errors
            if (error.response?.status === 400) {
              return error.response.data?.message || 'Invalid input. Please check your details.'
            }

            return error.message || 'Authentication failed'
          }
          console.error('Auth Error: Authentication failed')
          return 'Authentication failed'
        },
        isNetworkError: (_, event) => {
          if ('data' in event && event.data) {
            const error = event.data as AxiosError
            return error.name === 'AxiosError' && error.code === 'ERR_NETWORK'
          }
          return false
        }
      }),
      checkNetworkError: (context) => {
        if (context.isNetworkError) {
          console.error('Auth Error: Network error detected')
          // You could trigger a retry mechanism here
          // or show a specific UI for network errors
        }
      },
      clearUser: () => {
        authStore.logout()
      },
      redirectAfterLogin: (context) => {
        if (context.redirectTo) {
          window.location.href = context.redirectTo
        } else {
          window.location.href = '/dashboard'
        }
      },
      startSessionWarning: (context) => {
        if (context.tokenExpiry) {
          const timeUntilExpiry = context.tokenExpiry - Date.now();
          const warningTime = timeUntilExpiry - (5 * 60 * 1000); // 5 minutes before expiry
          
          if (warningTime > 0) {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('sessionWarning'));
            }, warningTime);
          }
        }
      },    
      stopSessionWarning: () => {
        window.dispatchEvent(new CustomEvent('clearSessionWarning'));
      },    
      showSessionWarning: () => {
        // This will be handled by the SessionWarning component
        window.dispatchEvent(new CustomEvent('showSessionWarning'));
      }
    },
    services: {
      loginService: (_, event) => {
        if (event.type !== 'LOGIN') {
          console.error('Auth Error: Invalid event type for login')
          return Promise.reject('Invalid event')
        }        
        
        const { email, password } = event
        sessionStorage.setItem('lastLoginAttempt', 'true')

        return authStore.login(email, password)
      },
      signupService: (_, event) => {
        if (event.type !== 'SIGNUP') {
          console.error('Auth Error: Invalid event type for signup')
          return Promise.reject('Invalid event')
        }
        
        const { username, email, password } = event
        sessionStorage.setItem('lastSignupAttempt', 'true')
        
        return authStore.signup(username, email, password)       
      },
      checkTokenService: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
          console.error('Auth Error: No token found')
          return Promise.reject('No token found')
        }
        
        try {
          return await authStore.getRefreshToken(token)
        } catch (error) {
          console.error('Auth Error: Token refresh failed', error)
          return Promise.reject('Token refresh failed')
        }
      }
    }
  })
}