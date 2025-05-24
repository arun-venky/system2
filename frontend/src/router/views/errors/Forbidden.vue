<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="text-center text-3xl font-extrabold text-gray-900">
        Access Forbidden
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        You don't have permission to access this page
      </p>
      <div class="mt-6 text-center">
        <router-link to="/dashboard" class="font-medium text-blue-600 hover:text-blue-500">
          Return to Dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No setup needed for this simple view
</script> 