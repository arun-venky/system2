import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth.store'
import type { RouteRecordRaw } from 'vue-router'

// Layout components
import DashboardLayout from '../router/layouts/DashboardLayout.vue';
import AdminLayout from '../router/layouts/AdminLayout.vue';

// Auth views
import Login from '../router/views/auth/Login.vue'
import Signup from './views/auth/Signup.vue'
import ForgotPassword from './views/auth/ForgotPassword.vue'
import ResetPassword from '../router/views/auth/ResetPassword.vue'

// Dashboard views
import Dashboard from './views/dashboard/Dashboard.vue'

// Management views
import RoleManagement from '../router/views/management/RoleManagement.vue'
import PageManagement from '../router/views/management/PageManagement.vue'
import SecurityManagement from '../router/views/management/SecurityManagement.vue'
import MenuManagement from '../router/views/management/MenuManagement.vue'
import UserManagement from '../router/views/management/UserManagement.vue'

// Error views
import Forbidden from './views/errors/Forbidden.vue'
import NotFound from './views/errors/NotFound.vue'
import Unauthorized from './views/errors/Unauthorized.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DashboardLayout,
    meta: { 
      requiresAuth: true,
      title: 'Dashboard'
    },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: { 
          title: 'Dashboard',
          requiresAuth: true
        }
      },
      {
        path: 'pages',
        name: 'page-management',
        component: PageManagement,
        meta: { 
          title: 'Page Management',
          requiresAuth: true,
          permissions: ['pages', 'read']
        }
      },
      {
        path: 'menus',
        name: 'menu-management',
        component: MenuManagement,
        meta: { 
          title: 'Menu Management',
          requiresAuth: true,
          permissions: ['menus', 'read']
        }
      },
      {
        path: 'users',
        name: 'user-management',
        component: UserManagement,
        meta: { 
          title: 'User Management',
          requiresAuth: true,
          permissions: ['users', 'read']
        }
      },
      {
        path: 'roles',
        name: 'role-management',
        component: RoleManagement,
        meta: { 
          title: 'Role Management',
          requiresAuth: true,
          permissions: ['roles', 'read']
        }
      },
      {
        path: 'security',
        name: 'security-management',
        component: SecurityManagement,
        meta: { 
          title: 'Security Management',
          requiresAuth: true,
          permissions: ['security', 'read']
        }
      }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { 
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Admin'
    },
    children: [     
    ]
  },
  {
    path: '/auth',
    meta: { requiresAuth: false },
    children: [
      {
        path: 'login',
        name: 'login',
        component: Login,
        meta: { 
          title: 'Login',
          requiresAuth: false
        }
      },
      {
        path: 'signup',
        name: 'signup',
        component: Signup,
        meta: { 
          title: 'Sign Up',
          requiresAuth: false
        }
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: ForgotPassword,
        meta: {
          title: 'Forgot Password',
          requiresAuth: false
        }
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: ResetPassword,
        meta: {
          title: 'Reset Password',
          requiresAuth: false
        }
      }
    ]
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: Unauthorized,
    meta: {
      title: 'Unauthorized',
      requiresAuth: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    meta: { 
      title: 'Not Found',
      requiresAuth: false
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Get meta properties from matched routes
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const requiresPermission = to.matched.some(record => record.meta.permissions) 
    ? to.matched.find(record => record.meta.permissions)?.meta.permissions as string[]
    : undefined

  // console.log('Navigation guard:', {
  //   to: to.path,
  //   matched: to.matched,
  //   requiresAuth,
  //   requiresAdmin,
  //   requiresPermission,
  //   meta: to.meta
  // })

  // Set page title
  document.title = `SystemTwo ${'| ' + to.meta.title || ''}`

  // // Check authentication status  
  // const isAuthenticated = await authStore.verifyAuth()
  // console.log('isAuthenticated:', isAuthenticated)

  // // Check if route requires authentication
  // if (requiresAuth && !isAuthenticated) {
  //   console.log('Auth required, redirecting to login')
  //   next({ name: 'login', query: { redirect: to.fullPath } })
  //   return
  // }

  // // Check admin access
  // if (requiresAdmin && !authStore.isAdmin) {
  //   next({ name: 'unauthorized' })
  //   return
  // }

  // // Check permissions
  // if (requiresPermission && !requiresPermission.every(permission => authStore.hasPermission(permission))) {
  //   next({ name: 'unauthorized' })
  //   return
  // }
  
  // console.log('able to access')
  next()
})

export default router