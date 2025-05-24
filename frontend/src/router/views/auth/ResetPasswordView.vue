<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Reset your password
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Please enter your new password below.
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
                  Password reset successful
                </h3>
                <div class="mt-2 text-sm text-green-700">
                  <p>
                    Your password has been reset successfully. You can now log in with your new password.
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

          <!-- Password Input -->
          <FormInput
            v-model="password"
            id="password"
            label="New password"
            type="password"
            autocomplete="new-password"
            required
            :disabled="isLoading || isSuccess"
            :error="passwordError"
            hint="Password must be at least 8 characters long and include a number and a special character"
          />

          <!-- Confirm Password Input -->
          <FormInput
            v-model="confirmPassword"
            id="confirmPassword"
            label="Confirm new password"
            type="password"
            autocomplete="new-password"
            required
            :disabled="isLoading || isSuccess"
            :error="confirmPasswordError"
          />

          <!-- Password Requirements -->
          <div class="text-sm text-gray-600">
            <p class="font-medium">Password requirements:</p>
            <ul class="list-disc list-inside space-y-1 mt-2">
              <li :class="{ 'text-green-600': password.length >= 8 }">
                At least 8 characters long
              </li>
              <li :class="{ 'text-green-600': /[A-Z]/.test(password) }">
                At least one uppercase letter
              </li>
              <li :class="{ 'text-green-600': /[a-z]/.test(password) }">
                At least one lowercase letter
              </li>
              <li :class="{ 'text-green-600': /[0-9]/.test(password) }">
                At least one number
              </li>
              <li :class="{ 'text-green-600': /[!@#$%^&*]/.test(password) }">
                At least one special character (!@#$%^&*)
              </li>
            </ul>
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            variant="primary"
            size="lg"
            :fullWidth="true"
            :disabled="isLoading || isSuccess || !isFormValid"
          >
            <span v-if="isLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Resetting password...
            </span>
            <span v-else>Reset password</span>
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
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline';
import Button from '../../../components/ui/button.vue';
import FormInput from '../../../components/ui/formInput.vue';
import Card from '../../../components/ui/card.vue';
import api from '../../../utils/api';

const route = useRoute();
const router = useRouter();

// Form state
const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const isSuccess = ref(false);
const errorMessage = ref('');

// Password validation
const passwordError = computed(() => {
  if (!password.value) return '';
  if (password.value.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password.value)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password.value)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password.value)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*]/.test(password.value)) return 'Password must contain at least one special character';
  return '';
});

const confirmPasswordError = computed(() => {
  if (!confirmPassword.value) return '';
  if (confirmPassword.value !== password.value) return 'Passwords do not match';
  return '';
});

const isFormValid = computed(() => {
  return (
    password.value &&
    confirmPassword.value &&
    !passwordError.value &&
    !confirmPasswordError.value
  );
});

// Handle form submission
const handleSubmit = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';

    // Get token from URL
    const token = route.query.token as string;
    if (!token) {
      throw new Error('Invalid or missing reset token');
    }

    // Call the password reset API
    await api.post('/auth/reset-password', {
      token,
      password: password.value
    });

    // Show success message
    isSuccess.value = true;

    // Redirect to login after a delay
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  } catch (error: any) {
    // Handle different types of errors
    if (error.response?.status === 400) {
      errorMessage.value = 'Invalid or expired reset token.';
    } else if (error.response?.status === 429) {
      errorMessage.value = 'Too many attempts. Please try again later.';
    } else {
      errorMessage.value = 'An error occurred. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};

// Check for token on component mount
onMounted(() => {
  const token = route.query.token;
  if (!token) {
    errorMessage.value = 'Invalid or missing reset token';
  }
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style> 