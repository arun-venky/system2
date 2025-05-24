import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'
import './assets/index.css'
import 'vue-toastification/dist/index.css'
import { setupInspect } from './utils/setupInspect'
import { useAuthStore } from './store/auth.store'

// Setup XState inspector in development mode
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_XSTATE_INSPECT === 'true') {
  setupInspect()
}

const app = createApp(App)
const pinia = createPinia()

// Toast configuration
const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)

// Initialize auth store
const authStore = useAuthStore()
authStore.initializeFromStorage()

app.mount('#app')