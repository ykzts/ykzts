import { defineConfig } from 'tsup'

export default defineConfig({
  dts: true,
  entry: [
    './src/docusaurus.ts',
    './src/index.ts',
    './src/next.ts',
    './src/react.ts'
  ],
  format: 'esm',
  sourcemap: true,
  target: 'es2024'
})
