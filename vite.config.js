import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  resolve: { alias: { vue: '@vue/compat' } }, // needed for bootstrap-vue
  plugins: [vue()],
})
