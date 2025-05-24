import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth.store'
import type { RouteRecordRaw } from 'vue-router'

// Layout components
import DashboardLayout from '../router/layouts/DashboardLayout.vue';
import AdminLayout from '../router/layouts/AdminLayout.vue';

// Auth views
import LoginView from '../router/views/auth/LoginView.vue'
import SignupView from '../router/views/auth/SignupView.vue'
import ForgotPasswordView from '../router/views/auth/ForgotPasswordView.vue'
import ResetPasswordView from '../router/views/auth/ResetPasswordView.vue'

// Dashboard views
import DashboardView from '../router/views/dashboard/DashboardView.vue'

// Management views
import RoleManagementView from '../router/views/management/RoleManagementView.vue'
import PageManagementView from '../router/views/management/PageManagementView.vue'
import SecurityManagementView from '../router/views/management/SecurityManagementView.vue'
import MenuManagementView from '../router/views/management/MenuManagementView.vue'
import UserManagementView from '../router/views/management/UserManagementView.vue'

// Error views
import ForbiddenView from '../router/views/errors/ForbiddenView.vue'
import NotFoundView from '../router/views/errors/NotFoundView.vue'
import UnauthorizedView from '../router/views/errors/UnauthorizedView.vue'

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
        component: DashboardView,
        meta: { 
          title: 'Dashboard',
          requiresAuth: true
        }
      },
      {
        path: 'pages',
        name: 'page-management',
        component: PageManagementView,
        meta: { 
          title: 'Page Management',
          requiresAuth: true,
          permissions: ['pages', 'read']
        }
      },
      {
        path: 'menus',
        name: 'menu-management',
        component: MenuManagementView,
        meta: { 
          title: 'Menu Management',
          requiresAuth: true,
          permissions: ['menus', 'read']
        }
      },
      {
        path: 'users',
        name: 'user-management',
        component: UserManagementView,
        meta: { 
          title: 'User Management',
          requiresAuth: true,
          permissions: ['users', 'read']
        }
      },
      {
        path: 'roles',
        name: 'role-management',
        component: RoleManagementView,
        meta: { 
          title: 'Role Management',
          requiresAuth: true,
          permissions: ['roles', 'read']
        }
      },
      {
        path: 'security',
        name: 'security-management',
        component: SecurityManagementView,
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
        component: LoginView,
        meta: { 
          title: 'Login',
          requiresAuth: false
        }
      },
      {
        path: 'signup',
        name: 'signup',
        component: SignupView,
        meta: { 
          title: 'Sign Up',
          requiresAuth: false
        }
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: ForgotPasswordView,
        meta: {
          title: 'Forgot Password',
          requiresAuth: false
        }
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: ResetPasswordView,
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
    component: UnauthorizedView,
    meta: {
      title: 'Unauthorized',
      requiresAuth: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
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

  console.log('Navigation guard:', {
    to: to.path,
    matched: to.matched,
    requiresAuth,
    requiresAdmin,
    requiresPermission,
    meta: to.meta
  })

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