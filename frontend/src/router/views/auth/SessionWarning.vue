<template>
    <Modal v-if="showWarning" @close="handleClose" title="Session Timeout Warning">
      <template #header>
        <h3 class="text-lg font-medium text-gray-900">Session Timeout Warning</h3>
      </template>
      <template #default>
        <div class="space-y-4">
          <p class="text-sm text-gray-500">
            Your session will expire in {{ timeLeft }} minutes. Would you like to stay logged in?
          </p>
          <div class="flex items-center space-x-2">
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                class="bg-primary-600 h-2.5 rounded-full transition-all duration-1000"
                :style="{ width: `${(timeLeft / warningThreshold) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <Button variant="ghost" @click="handleLogout">Logout</Button>
          <Button variant="primary" @click="handleExtend">Stay Logged In</Button>
        </div>
      </template>
    </Modal>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useAuthStore } from '@/store/auth.store';
  import { useRouter } from 'vue-router';
  import Modal from '@/components/ui/modal.vue';
  import Button from '@/components/ui/button.vue';
  
  const authStore = useAuthStore();
  const router = useRouter();
  const showWarning = ref(false);
  const timeLeft = ref(5);
  const warningThreshold = 5; // Show warning 5 minutes before expiry
  
  let warningTimer: number;
  let countdownTimer: number;
  
  const startWarning = () => {
    const sessionTimeout = authStore.sessionTimeout || 30; // Default to 30 minutes if not set
    const warningTime = (sessionTimeout - warningThreshold) * 60 * 1000;
    
    warningTimer = window.setTimeout(() => {
      showWarning.value = true;
      startCountdown();
    }, warningTime);
  };
  
  const startCountdown = () => {
    countdownTimer = window.setInterval(() => {
      timeLeft.value--;
      if (timeLeft.value <= 0) {
        handleLogout();
      }
    }, 60000);
  };
  
  const handleExtend = async () => {
    try {
      await authStore.refreshSession();
      showWarning.value = false;
      clearInterval(countdownTimer);
      startWarning();
    } catch (error) {
      console.error('Failed to extend session:', error);
      handleLogout();
    }
  };
  
  const handleLogout = () => {
    authStore.logout();
    router.push('/login');
  };
  
  const handleClose = () => {
    showWarning.value = false;
    clearInterval(countdownTimer);
  };
  
  onMounted(() => {
    startWarning();
  });
  
  onUnmounted(() => {
    clearTimeout(warningTimer);
    clearInterval(countdownTimer);
  });
  </script>