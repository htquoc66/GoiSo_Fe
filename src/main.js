// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'
import router from './router'  

// Import Bootstrap & CSS
import 'bootstrap/dist/js/bootstrap.bundle.js'
import 'bootstrap/dist/css/bootstrap.min.css'

// Cấu hình axios
// axios.defaults.baseURL = 'http://172.16.100.252/goiso/public/index.php/api'
axios.defaults.baseURL = 'http://127.0.0.1:8000/api'
axios.defaults.baseURL = 'http://172.16.101.136:8000/api'


axios.defaults.headers.common['Accept'] = 'application/json'

const app = createApp(App)
app.config.globalProperties.$axios = axios
app.use(router)  
app.mount('#app')
