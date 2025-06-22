import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
   publicDir: 'src',
   server: {
      port: 6660,
      strictPort: true,
   },
}))
