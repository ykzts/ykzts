/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig, type PluginOption } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()] as PluginOption[],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts']
  }
})
