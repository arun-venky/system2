<template>
  <div class="page-container flex-center min-h-screen">
    <div class="w-full max-w-md">
      <Card>
        <template #header>
          <div class="text-center">
            <h2 class="text-3xl font-extrabold text-gray-900">
              Sign Up
            </h2>
            <p class="mt-2 text-sm text-gray-600">
              Or
              <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
                sign in to your existing account
              </router-link>
            </p>
          </div>
        </template>

        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div v-if="state.context.errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ state.context.errorMessage }}</p>
              </div>
            </div>
          </div>

          <FormInput
            v-model="username"
            id="username"
            label="Username"
            type="text"
            autocomplete="username"
            required
          />

          <FormInput
            v-model="email"
            id="email"
            label="Email address"
            type="email"
            autocomplete="email"
            required
          />

          <FormInput
            v-model="password"
            id="password"
            label="Password"
            type="password"
            autocomplete="new-password"
            required
            hint="Password must be at least 6 characters"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            :fullWidth="true"
            :disabled="state.matches('registering')"
          >
            <span v-if="state.matches('registering')" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </span>
            <span v-else>Create account</span>
          </Button>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMachine } from '@xstate/vue'
import { createAuthMachine } from '../../../machines/authMachine'
import { useToast } from 'vue-toastification'
import Button from '../../../components/ui/button.vue'
import FormInput from '../../../components/ui/formInput.vue'
import Card from '../../../components/ui/card.vue'

const toast = useToast()

// Form data
const username = ref('')
const email = ref('')
const password = ref('')

// Initialize auth machine
const { state, send } = useMachine(createAuthMachine({
  redirectTo: '/dashboard'
}))

// Handle form submission
const handleSubmit = () => {
  if (password.value.length < 6) {
    toast.error('Password must be at least 6 characters')
    return
  }
  
  send({
    type: 'SIGNUP',
    username: username.value,
    email: email.value,
    password: password.value
  })
}
</script>