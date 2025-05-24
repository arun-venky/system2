<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Reset your password
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Enter your email address and we'll send you a link to reset your password.
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <Card>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Success Message -->
          <div v-if="isSuccess" class="rounded-md bg-green-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <CheckCircleIcon class="h-5 w-5 text-green-400" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">
                  Password reset email sent
                </h3>
                <div class="mt-2 text-sm text-green-700">
                  <p>
                    If an account exists with that email address, we've sent a password reset link.
                    Please check your email.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ errorMessage }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Email Input -->
          <FormInput
            v-model="email"
            id="email"
            label="Email address"
            type="email"
            autocomplete="email"
            required
            :disabled="isLoading || isSuccess"
          />

          <!-- Submit Button -->
          <Button
            type="submit"
            variant="primary"
            size="lg"
            :fullWidth="true"
            :disabled="isLoading || isSuccess"
          >
            <span v-if="isLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending reset link...
            </span>
            <span v-else>Send reset link</span>
          </Button>

          <!-- Back to Login Link -->
          <div class="text-sm text-center">
            <router-link
              to="/login"
              class="font-medium text-primary-600 hover:text-primary-500"
            >
              Back to login
            </router-link>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline';
import Button from '../../../components/ui/button.vue';
import FormInput from '../../../components/ui/formInput.vue';
import Card from '../../../components/ui/card.vue';
import api from '../../../utils/api';

const router = useRouter();

// Form state
const email = ref('');
const isLoading = ref(false);
const isSuccess = ref(false);
const errorMessage = ref('');

// Handle form submission
const handleSubmit = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';

    // Call the password reset API
    await api.post('/auth/forgot-password', {
      email: email.value
    });

    // Show success message
    isSuccess.value = true;

    // Optional: Redirect after a delay
    setTimeout(() => {
      router.push('/login');
    }, 5000);
  } catch (error: any) {
    // Handle different types of errors
    if (error.response?.status === 404) {
      errorMessage.value = 'No account found with that email address.';
    } else if (error.response?.status === 429) {
      errorMessage.value = 'Too many attempts. Please try again later.';
    } else {
      errorMessage.value = 'An error occurred. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style> 