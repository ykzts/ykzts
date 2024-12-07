// @ts-check

import tseslint from 'typescript-eslint'
import baseConfig from './dist/index.js'

export default tseslint.config(...baseConfig, {
  ignores: ['dist/*', 'node_modules/*']
})
