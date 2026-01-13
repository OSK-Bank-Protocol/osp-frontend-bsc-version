import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { APP_ENV, DISABLE_CONSOLE_IN_PROD } from './services/environment'

// Disable console logs in production environment
if (APP_ENV === 'PROD' && DISABLE_CONSOLE_IN_PROD) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  // Keep console.warn and console.error for important messages
}

// Log environment variables on startup (will only show in dev/test)
console.log("Application starting with environment:", import.meta.env);


const app = createApp(App)

app.use(router)

app.mount('#app')
