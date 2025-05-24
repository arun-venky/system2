<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
      <div class="flex items-center justify-center h-16 border-b">
        <h1 class="text-xl font-bold text-gray-800">Admin Panel</h1>
      </div>
      <nav class="mt-5 px-2">
        <router-link
          v-for="route in adminRoutes"
          :key="route.path"
          :to="{ name: route.name }"
          class="group flex items-center px-2 py-2 text-base font-medium rounded-md"
          :class="[
            $route.name === route.name
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          ]"
        >
          <component
            :is="route.meta.icon"
            class="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
          />
          {{ route.meta.title }}
        </router-link>
      </nav>
    </aside>
    <div class="ml-64">
      <!-- Top Bar -->
      <div class="flex items-center justify-between border-b border-gray-200 h-16">
        <div class="flex items-center">
          <button
            @click="toggleSidebar"
            class="text-gray-500 hover:text-gray-900 mr-4"
          >
            <span class="sr-only">Open sidebar</span>
            <component :is="renderIcon('Bars3Icon', 'h-6 w-6')" />
          </button>
          <h1 class="text-xl font-bold text-gray-800">{{ currentRouteTitle }}</h1>
        </div>
        <div class="flex items-center space-x-4">
          <button
            @click="toggleNotifications"
            class="text-gray-500 hover:text-gray-900"
          >
            <span class="sr-only">View notifications</span>
            <BellIcon class="h-6 w-6" />
          </button>
          <div class="h-8 w-px bg-gray-200 mx-4"></div>
          <div class="flex items-center space-x-4">
            <div class="h-10 w-10 bg-gray-100 rounded-full">
              <img :src="userAvatar" alt="User Avatar" class="h-10 w-10 rounded-full" />
            </div>
            <div class="text-sm leading-6 font-medium text-gray-800">
              <div>{{ userName }}</div>
              <div class="text-xs leading-5 font-medium text-gray-500">{{ userRole }}</div>
            </div>
            <button
              @click="logout"
              class="text-gray-500 hover:text-gray-900"
            >
              <span class="sr-only">Log out</span>
              <ArrowRightOnRectangleIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <!-- End Top Bar -->
      <div class="p-4">
        <router-view></router-view>
      </div>
      <!-- Notifications Panel -->
      <div
        v-if="showNotificationsPanel"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <div class="bg-white rounded-lg overflow-hidden shadow-xl">
          <div class="px-4 py-5 bg-gray-50">
            <div class="flex items-center justify-between">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Notifications</h3>
              <button
                @click="toggleNotifications"
                class="text-gray-500 hover:text-gray-900"
              >
                <span class="sr-only">Close notifications</span>
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
            <div class="mt-2 text-sm text-gray-500">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="flex items-center justify-between py-2"
              >
                <div class="flex items-center">
                  <div class="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <component
                      :is="notification.icon"
                      class="h-5 w-5 text-gray-400"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ notification.title }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ notification.message }}
                    </div>
                    <div class="mt-1 text-xs text-gray-400">
                      {{ formatDate(notification.timestamp) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="px-4 py-4 bg-gray-50 text-right">
            <button
              @click="toggleNotifications"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      <!-- End Notifications Panel -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth.store'
import { useIcon } from '@/composables/useIcon';

const { getIcon, renderIcon } = useIcon();
const isSidebarOpen = ref(true)
const showNotificationsPanel = ref(false)
const notifications = ref([
  // Example notifications
  {
    id: 1,
    title: 'Role updated',
    message: 'The "Admin" role was updated.',
    timestamp: new Date(),
    icon: getIcon('ShieldCheckIcon')
  },
  {
    id: 2,
    title: 'User added',
    message: 'A new user was added.',
    timestamp: new Date(),
    icon: getIcon('UserIcon')
  }
])
const unreadNotifications = computed(() => notifications.value.length > 0)

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => authStore.user?.username || 'Admin')
const userRole = computed(() => authStore.user?.role || 'Administrator')
const userAvatar = computed(() => '/default-avatar.png')

const currentRouteTitle = computed(() => {
  const match = adminRoutes.find(r => r.name === route.name)
  return match ? match.meta.title : 'Admin'
})

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function toggleNotifications() {
  showNotificationsPanel.value = !showNotificationsPanel.value
}

function showHelp() {
  // Implement help modal or redirect
  alert('Help is not implemented yet.')
}

function logout() {
  authStore.logout()
  router.push({ name: 'login' })
}

function formatDate(date: Date) {
  return date.toLocaleString()
}

// Admin routes (should match your router config)
const adminRoutes = [
  {
    path: '/admin/menus',
    name: 'menu-management',
    meta: { title: 'Menu Management', icon: getIcon('ListBulletIcon') }
  },
  {
    path: '/admin/users',
    name: 'user-management',
    meta: { title: 'User Management', icon: getIcon('UserIcon') }
  },
  {
    path: '/admin/roles',
    name: 'role-management',
    meta: { title: 'Role Management', icon: getIcon('ShieldCheckIcon') }
  },
  {
    path: '/admin/security',
    name: 'security-management',
    meta: { title: 'Security Management', icon: getIcon('LockClosedIcon') }
  },
  {
    path: '/admin/pages',
    name: 'page-management',
    meta: { title: 'Page Management', icon: getIcon('DocumentIcon') }
  }
]
</script>

<style scoped>
/* Add transitions for sidebar and notifications panel */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style> 