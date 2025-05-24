<template>  
    <div class="section">
      <h1 class="section-title">Dashboard</h1>
    </div>
    
    <div v-if="state.matches('loading')" class="flex-center py-6">
      <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    
    <div v-else-if="state.matches('error')" class="section">
      <Card>
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading dashboard data</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ state.context.errorMessage }}</p>
            </div>
            <div class="mt-4">
              <Button variant="danger" size="sm" @click="send('RETRY')">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
    
    <div>
      <!-- Welcome section -->
      <div class="section">
        <Card>
          <h2 class="text-xl font-semibold text-gray-800">Welcome, {{ user?.username || 'User' }}!</h2>
          <p class="mt-1 text-gray-600">You are logged in as <span class="font-medium">{{ userRole }}</span></p>
        </Card>
      </div>
      
      <!-- Stats -->
      <div class="section">
        <div class="grid-responsive">
          <Card>
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Total Pages
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ state.context.pages.length }}
                  </div>
                </dd>
              </div>
            </div>
            <template #footer>
              <div class="text-sm">
                <router-link to="/pages" class="font-medium text-blue-600 hover:text-blue-500">
                  View all pages
                </router-link>
              </div>
            </template>
          </Card>
          
          <Card>
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Available Menus
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ state.context.menus.length }}
                  </div>
                </dd>
              </div>
            </div>
            <template #footer>
              <div class="text-sm">
                <router-link to="/menus" class="font-medium text-blue-600 hover:text-blue-500" v-if="userHasAccess(['Admin'])">
                  Manage menus
                </router-link>
                <span v-else class="text-gray-500">Menu management requires Admin role</span>
              </div>
            </template>
          </Card>
          
          <Card>
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Your Role
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ userRole }}
                  </div>
                </dd>
              </div>
            </div>
            <template #footer>
              <div class="text-sm">
                <router-link to="/profile" class="font-medium text-blue-600 hover:text-blue-500">
                  View your profile
                </router-link>
              </div>
            </template>
          </Card>
        </div>
      </div>
      
      <!-- Recent pages -->
      <div class="section">
        <h3 class="section-title">Recent Pages</h3>
        <Card>
          <ul role="list" class="divide-y divide-gray-200">
            <li v-for="page in recentPages" :key="page._id">
              <div class="block hover:bg-gray-50">
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-blue-600 truncate">{{ page.title }}</p>
                    <div class="ml-2 flex-shrink-0 flex">
                      <p class="badge badge-blue">
                        {{ page.slug }}
                      </p>
                    </div>
                  </div>
                  <div class="mt-2 sm:flex sm:justify-between">
                    <div class="sm:flex">
                      <p class="flex items-center text-sm text-gray-500 truncate">
                        {{ truncateText(page.content, 100) || 'No content' }}
                      </p>
                    </div>
                    <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                      </svg>
                      <p>Created: {{ formatDate(page.createdAt) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li v-if="recentPages.length === 0">
              <div class="px-4 py-4 sm:px-6 text-gray-500 text-center">
                No pages available
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </div>  
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useMachine } from '@xstate/vue'
import { createDashboardMachine } from '../../../machines/dashboardMachine'
import DashboardLayout from '../../layouts/DashboardLayout.vue'
import Button from '../../../components/ui/button.vue'
import Card from '../../../components/ui/card.vue'

// Get user data from localStorage
const userDataString = localStorage.getItem('user')
const user = ref(userDataString ? JSON.parse(userDataString) : null)

// Get user role
const userRole = computed(() => {
  if (user.value?.role) {
    if (typeof user.value.role === 'string') {
      return user.value.role
    } else if (typeof user.value.role === 'object' && user.value.role.name) {
      return user.value.role.name
    }
  }
  return 'User'
})

// Check if user has access based on roles
const userHasAccess = (roles: string[]) => {
  const currentRole = userRole.value
  return roles.includes(currentRole)
}

// Initialize dashboard machine
const { state, send } = useMachine(createDashboardMachine())

// Get recent pages (up to 5)
const recentPages = computed(() => {
  return [...state.value.context.pages]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// Truncate text
const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Fetch dashboard data on mount
onMounted(() => {
  console.log('Fetching dashboard data');
  send('FETCH')
})
</script>