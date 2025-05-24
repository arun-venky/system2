<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Error Icon -->
      <div class="flex justify-center">
        <div class="rounded-full bg-red-100 p-3">
          <ShieldExclamationIcon class="h-12 w-12 text-red-600" />
        </div>
      </div>

      <!-- Error Title -->
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Access Denied
      </h2>

      <!-- Error Message -->
      <div class="mt-2 text-center">
        <p class="text-sm text-gray-600">
          You don't have permission to access this resource.
        </p>
        <p v-if="requiredPermission" class="mt-1 text-sm text-gray-500">
          Required permission: <span class="font-medium">{{ requiredPermission }}</span>
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 space-y-4">
        <!-- Back Button -->
        <Button
          variant="secondary"
          size="lg"
          :fullWidth="true"
          @click="goBack"
        >
          <ArrowLeftIcon class="h-5 w-5 mr-2" />
          Go Back
        </Button>

        <!-- Home Button -->
        <Button
          variant="primary"
          size="lg"
          :fullWidth="true"
          @click="goHome"
        >
          <HomeIcon class="h-5 w-5 mr-2" />
          Go to Home
        </Button>

        <!-- Contact Support Button -->
        <Button
          variant="ghost"
          size="lg"
          :fullWidth="true"
          @click="contactSupport"
        >
          <QuestionMarkCircleIcon class="h-5 w-5 mr-2" />
          Contact Support
        </Button>
      </div>

      <!-- Additional Information -->
      <div class="mt-8 text-center text-sm text-gray-500">
        <p>If you believe this is an error, please contact your administrator.</p>
        <p class="mt-1">
          Error Code: <span class="font-mono">403</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ShieldExclamationIcon,
  ArrowLeftIcon,
  HomeIcon,
  QuestionMarkCircleIcon
} from '@heroicons/vue/24/outline';
import Button from '../../../components/ui/button.vue';

const route = useRoute();
const router = useRouter();

// Get required permission from route meta if available
const requiredPermission = computed(() => {
  return route.meta.requiresPermission as string | undefined;
});

// Navigation methods
const goBack = () => {
  router.back();
};

const goHome = () => {
  router.push('/');
};

const contactSupport = () => {
  // You can implement this based on your support system
  // For example, opening a support ticket or email
  window.location.href = 'mailto:support@yourdomain.com';
};

// Log unauthorized access attempt
onMounted(() => {
  console.warn('Unauthorized access attempt:', {
    path: route.fullPath,
    requiredPermission: requiredPermission.value,
    timestamp: new Date().toISOString()
  });
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style> 