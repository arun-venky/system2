<template>
  <div class="page-container">
    <div class="section">
      <Card title="Profile Information">
        <div v-if="user" class="space-y-4">
          <div>
            <label class="form-label">Username</label>
            <div class="mt-1 text-sm text-gray-900">{{ user.username }}</div>
          </div>
          <div>
            <label class="form-label">Email</label>
            <div class="mt-1 text-sm text-gray-900">{{ user.email }}</div>
          </div>
          <div>
            <label class="form-label">Role</label>
            <div class="mt-1 text-sm text-gray-900">{{ user.role?.name || 'No role assigned' }}</div>
          </div>
        </div>
        <div v-else class="text-sm text-gray-500">
          Loading profile information...
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from '../../../components/ui/card.vue'

// Get user data from localStorage
const user = computed(() => {
  const userDataString = localStorage.getItem('user')
  return userDataString ? JSON.parse(userDataString) : null
})
</script> 