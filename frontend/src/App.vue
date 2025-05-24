<template>
  <div class="min-h-screen bg-gray-50">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// Check auth status
const verifyAuth = async () => {
  const isAuthenticated = await authStore.verifyAuth();
  if (!isAuthenticated) {
    // Handle unauthenticated state
    router.push('/auth/login');
  } else{
    console.log('User is authenticated');
  }
};

// Call on component mount
onMounted(() => {
  console.log('Verify auth status');
  verifyAuth();
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>