<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">Welcome to SYSTEMTWO Admin</h1>
      </div>
    </header>
    
    <!-- Main content -->
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Content section -->
        <div class="px-4 py-6 sm:px-0">
          <div class="border-4 border-dashed border-gray-200 rounded-lg p-6">
            <div v-if="isAuthenticated" class="text-center">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Welcome back, {{ user?.username || 'User' }}!</h2>
              <p class="text-gray-600 mb-6">You are logged in as {{ userRole }}</p>
              <div class="space-y-4">
                <router-link to="/dashboard" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Go to Dashboard
              </router-link>
              </div>
            </div>
            <div v-else class="text-center">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Welcome to SYSTEMTWO Admin</h2>
              <p class="text-gray-600 mb-6">Please log in to access the dashboard</p>
              <div class="space-y-4">
                <router-link to="/login" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Login
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="bg-white">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-gray-500 text-sm">
          &copy; {{ new Date().getFullYear() }} SYSTEMTWO Admin. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Get user data from localStorage
const userDataString = localStorage.getItem('user')
const user = computed(() => userDataString ? JSON.parse(userDataString) : null)

// Check if user is authenticated
const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token')
})

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
</script>