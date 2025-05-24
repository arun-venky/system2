<template>
  <nav class="bg-gray-800 w-64 min-h-screen">
    <div class="px-4 py-6">
      <h2 class="text-xl font-semibold text-white">Navigation</h2>
    </div>
    <div class="px-2">
      <div class="space-y-1">
        <!-- Dashboard -->
        <router-link
          :to="{ name: 'dashboard' }"
          class="group flex items-center px-2 py-2 text-base font-medium rounded-md"
          :class="[
            $route.name === 'dashboard'
              ? 'bg-gray-900 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          ]"
        >
          <HomeIcon class="mr-4 h-6 w-6" />
          Dashboard
        </router-link>

        <!-- Management Section -->
        <div v-if="isAdmin" class="mt-8">
          <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Management
          </h3>
          <div class="mt-1 space-y-1">
            <!-- Role Management -->
            <router-link
              v-if="hasPermission('roles')"
              :to="{ name: 'role-management' }"
              class="group flex items-center px-2 py-2 text-base font-medium rounded-md"
              :class="[
                $route.name === 'role-management'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              ]"
            >
              <ShieldCheckIcon class="mr-4 h-6 w-6" />
              Role Management
            </router-link>

            <!-- Page Management -->
            <router-link
              v-if="hasPermission('pages')"
              :to="{ name: 'page-management' }"
              class="group flex items-center px-2 py-2 text-base font-medium rounded-md"
              :class="[
                $route.name === 'page-management'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              ]"
            >
              <DocumentIcon class="mr-4 h-6 w-6" />
              Page Management
            </router-link>

            <!-- Security Management -->
            <router-link
              v-if="hasPermission('security')"
              :to="{ name: 'security-management' }"
              class="group flex items-center px-2 py-2 text-base font-medium rounded-md"
              :class="[
                $route.name === 'security-management'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              ]"
            >
              <LockClosedIcon class="mr-4 h-6 w-6" />
              Security Management
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../../store/auth.store';
import {
  HomeIcon,
  ShieldCheckIcon,
  DocumentIcon,
  LockClosedIcon
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();

const isAdmin = computed(() => authStore.isAdmin);

const hasPermission = (resource: string) => {
  return authStore.hasPermission(resource);
};
</script> 