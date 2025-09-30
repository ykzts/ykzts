import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/__tests__/accessibility/**'],
    globals: true,
    setupFiles: ['./vitest.setup.ts']
  }
})
