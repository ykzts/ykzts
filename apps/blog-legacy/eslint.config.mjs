// @ts-check

import baseConfig from '@ykzts/eslint-config/next'
import tseslint from 'typescript-eslint'

export default tseslint.config(...baseConfig, {
  ignores: ['.docusaurus/*', 'build/*', 'node_modules/*']
})
