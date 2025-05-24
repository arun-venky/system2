import { createMachine, assign } from 'xstate'
import api from '../utils/api'

// Define interfaces
export interface DashboardContext {
  user: any | null
  menus: any[]
  pages: any[]
  stats: any | null
  errorMessage: string | null
  isLoading: boolean
}

interface DashboardResponse {
  user: any
  menus: any[]
  pages: any[]
  stats: any | null
  message?: string
}

export type DashboardEvent =
  | { type: 'FETCH' }
  | { type: 'RETRY' }
  | { type: 'LOGOUT' }
  | { type: 'done.invoke.fetchDashboardData'; data: DashboardResponse }
  | { type: 'error.platform.fetchDashboardData'; data: { message: string } }

export type DashboardState =
  | { value: 'idle'; context: DashboardContext }
  | { value: 'loading'; context: DashboardContext }
  | { value: 'loaded'; context: DashboardContext }
  | { value: 'error'; context: DashboardContext }

// Create dashboard machine
export const createDashboardMachine = (initialContext: Partial<DashboardContext> = {}) => {
  return createMachine<DashboardContext, DashboardEvent, DashboardState>({
    id: 'dashboard',
    initial: 'idle',
    context: {
      user: null,
      menus: [],
      pages: [],
      stats: null,
      errorMessage: null,
      isLoading: false,
      ...initialContext
    },
    states: {
      idle: {
        on: {
          FETCH: { target: 'loading' }
        }
      },
      loading: {
        entry: assign({ isLoading: true }),
        invoke: {
          src: 'fetchDashboardData',
          onDone: {
            target: 'loaded',
            actions: ['setDashboardData']
          },
          onError: {
            target: 'error',
            actions: ['setError']
          }
        }
      },
      loaded: {
        entry: assign({ isLoading: false }),
        on: {
          FETCH: { target: 'loading' },
          LOGOUT: { target: 'idle', actions: ['clearData'] }
        }
      },
      error: {
        entry: assign({ isLoading: false }),
        on: {
          RETRY: { target: 'loading' },
          LOGOUT: { target: 'idle', actions: ['clearData'] }
        }
      }
    }
  }, {
    actions: {
      setDashboardData: assign({
        user: (_, event) => {
          if ('data' in event && event.data) {
            return (event.data as DashboardResponse).user || null
          }
          return null
        },
        menus: (_, event) => {
          if ('data' in event && event.data) {
            return (event.data as DashboardResponse).menus || []
          }
          return []
        },
        pages: (_, event) => {
          if ('data' in event && event.data) {
            return (event.data as DashboardResponse).pages || []
          }
          return []
        },
        stats: (_, event) => {
          if ('data' in event && event.data) {
            return (event.data as DashboardResponse).stats || null
          }
          return null
        },
        errorMessage: (_) => null
      }),
      setError: assign({
        errorMessage: (_, event) => {
          if ('data' in event && event.data) {
            return (event.data as { message: string }).message || 'Failed to load dashboard data'
          }
          return 'Failed to load dashboard data'
        }
      }),
      clearData: assign({
        user: (_) => null,
        menus: (_) => [],
        pages: (_) => [],
        stats: (_) => null
      })
    },
    services: {
      fetchDashboardData: async () => {
        console.log('Fetching dashboard data');
        // Get user data from localStorage
        const userDataString = localStorage.getItem('user')
        const userData = userDataString ? JSON.parse(userDataString) : null
        
        // Fetch menus available to the user
        const menusResponse = await api.get('/menus')
        
        // Fetch pages
        const pagesResponse = await api.get('/pages')
        
        // Return all data
        return {
          user: userData,
          menus: menusResponse.data,
          pages: pagesResponse.data,
          stats: null // We don't have a stats endpoint yet
        }
      }
    }
  })
}