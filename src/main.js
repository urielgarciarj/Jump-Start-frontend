import './assets/main.css'
import store from './store'
import router from './routes'
import 'bootstrap/dist/css/bootstrap.css'

import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(store)
app.use(router)
app.mount('#app')
