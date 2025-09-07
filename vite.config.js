import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  //base: '/manhinh/',   // 👈 đúng tên thư mục bạn copy vào htdocs

})



// import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'

// export default defineConfig({
//   plugins: [vue()],
//   base: '/manhinh/',   // 👈 đúng tên thư mục bạn copy vào htdocs
// })
